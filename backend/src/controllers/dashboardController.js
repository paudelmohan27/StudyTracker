const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

/**
 * GET /api/dashboard/summary
 * Returns aggregated dashboard data:
 *  - overall progress
 *  - upcoming exams with warnings
 *  - urgent (behind schedule) subjects
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).lean();
    const allTopics = await Topic.find({ user: req.user._id }).lean();

    const now = new Date();

    // Build per-subject stats
    const subjectStats = subjects.map((subject) => {
      const topics = allTopics.filter((t) => String(t.subject) === String(subject._id));
      const totalTopics = topics.length;
      const completedTopics = topics.filter((t) => t.status === 'COMPLETED').length;
      const averageProgress =
        totalTopics > 0
          ? Math.round(topics.reduce((sum, t) => sum + t.progress, 0) / totalTopics)
          : 0;

      // Days until exam
      let daysUntilExam = null;
      let isOverdue = false;
      let isUrgent = false;

      if (subject.examDate) {
        const examMs = new Date(subject.examDate) - now;
        daysUntilExam = Math.ceil(examMs / (1000 * 60 * 60 * 24));
        isOverdue = daysUntilExam < 0;
        // Urgent = exam within 7 days AND subject not fully complete
        isUrgent = daysUntilExam >= 0 && daysUntilExam <= 7 && averageProgress < 100;
      }

      const isBehindSchedule = isUrgent || (isOverdue && averageProgress < 100);

      return {
        ...subject,
        totalTopics,
        completedTopics,
        averageProgress,
        daysUntilExam,
        isOverdue,
        isUrgent,
        isBehindSchedule,
      };
    });

    // Overall progress across all topics
    const totalTopicsAll = allTopics.length;
    const overallProgress =
      totalTopicsAll > 0
        ? Math.round(allTopics.reduce((sum, t) => sum + t.progress, 0) / totalTopicsAll)
        : 0;

    // Upcoming exams in the next 30 days
    const upcomingExams = subjectStats
      .filter((s) => s.daysUntilExam !== null && s.daysUntilExam >= 0 && s.daysUntilExam <= 30)
      .sort((a, b) => a.daysUntilExam - b.daysUntilExam);

    // Urgent / behind schedule subjects
    const urgentSubjects = subjectStats.filter((s) => s.isBehindSchedule);

    // Status breakdown counts
    const statusCounts = {
      NOT_STARTED: allTopics.filter((t) => t.status === 'NOT_STARTED').length,
      IN_PROGRESS: allTopics.filter((t) => t.status === 'IN_PROGRESS').length,
      COMPLETED: allTopics.filter((t) => t.status === 'COMPLETED').length,
    };

    res.json({
      success: true,
      data: {
        overallProgress,
        totalSubjects: subjects.length,
        totalTopics: totalTopicsAll,
        statusCounts,
        upcomingExams,
        urgentSubjects,
        allSubjects: subjectStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
