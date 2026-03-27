const { v4: uuidv4 } = require('uuid');
const Expert = require('../models/Expert');
const ChatRoom = require('../models/ChatRoom');

// Subject slug → DB subject key mapping
// Accepts flexible input from ScholarSync
const SUBJECT_MAP = {
  'computer_networks': 'computer_networks',
  'computer-networks': 'computer_networks',
  'computernetworks': 'computer_networks',
  'cn': 'computer_networks',

  'operating_systems': 'operating_systems',
  'operating-systems': 'operating_systems',
  'os': 'operating_systems',

  'database_management_system': 'database_management_system',
  'dbms': 'database_management_system',
  'database': 'database_management_system',

  'software_engineering': 'software_engineering',
  'se': 'software_engineering',

  'data_structures_and_algorithms': 'data_structures_and_algorithms',
  'dsa': 'data_structures_and_algorithms',
  'data-structures': 'data_structures_and_algorithms',

  'greedy': 'greedy',

  'math': 'math',
  'mathematics': 'math',

  'binary_search': 'binary_search',
  'binary-search': 'binary_search',
  'bs': 'binary_search',

  'two_pointers': 'two_pointers',
  'two-pointers': 'two_pointers',
  'tp': 'two_pointers',

  'graph': 'graph',
  'graphs': 'graph',
};

// @desc    ScholarSync calls this to get a chat room URL
// @route   GET /api/connect?subject=greedy
// @access  Public (ScholarSync server-to-server)
const connectUser = async (req, res) => {
  try {
    const subjectRaw = (req.query.subject || '').toLowerCase().trim();

    if (!subjectRaw) {
      return res.status(400).json({ message: 'subject query parameter is required' });
    }

    const subjectKey = SUBJECT_MAP[subjectRaw];
    if (!subjectKey) {
      return res.status(400).json({
        message: `Unknown subject: "${subjectRaw}"`,
        availableSubjects: Object.keys(SUBJECT_MAP),
      });
    }

    // Find expert for this subject
    const expert = await Expert.findOne({ subject: subjectKey });
    if (!expert) {
      return res.status(404).json({ message: `No expert found for subject: ${subjectKey}` });
    }

    // Create a new unique room for this session
    const roomId = uuidv4();
    const studentId = req.query.studentId || null;

    await ChatRoom.create({
      roomId,
      expertId: expert._id,
      subject: subjectKey,
      studentId,
    });

    const chatUrl = `/chat/${roomId}`;
    const fullUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}${chatUrl}`;

    res.json({
      roomId,
      chatUrl,
      fullUrl,
      expert: {
        name: expert.name,
        subject: expert.subjectLabel,
        description: expert.description,
        isOnline: expert.isOnline,
      },
    });
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({ message: 'Server error creating chat room' });
  }
};

module.exports = { connectUser };
