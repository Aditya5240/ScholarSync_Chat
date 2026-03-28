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

const connectAndRedirect = async (req, res) => {
  try {
    const subjectRaw = (req.query.subject || '').toLowerCase().trim();
    if (!subjectRaw) return res.status(400).send('subject query parameter is required');

    const subjectKey = SUBJECT_MAP[subjectRaw];
    if (!subjectKey) return res.status(400).send(`Unknown subject: "${subjectRaw}"`);

    const expert = await Expert.findOne({ subject: subjectKey });
    if (!expert) return res.status(404).send(`No expert found for subject: ${subjectKey}`);

    const studentId = req.query.studentId || null;
    let roomId;

    if (studentId) {
      // Check for an existing session first to preserve history
      const existingRoom = await ChatRoom.findOne({
        studentId,
        expertId: expert._id,
        isActive: true,
      });

      if (existingRoom) {
        roomId = existingRoom.roomId;
      }
    }

    if (!roomId) {
      // Create a new unique room right on time
      roomId = uuidv4();
      await ChatRoom.create({
        roomId,
        expertId: expert._id,
        subject: subjectKey,
        studentId,
      });
    }

    const fullUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/chat/${roomId}`;
    res.redirect(fullUrl);
  } catch (error) {
    console.error('Redirect Connect error:', error);
    res.status(500).send('Server error creating chat room');
  }
};

// @desc    Get all 10 experts with direct session URLs
// @route   GET /api/connect/all
// @access  Public
const getAllExperts = async (req, res) => {
  try {
    const studentId = req.query.studentId || null;
    const allExperts = await Expert.find({});
    
    // Find all active rooms for this student
    const activeRooms = studentId 
      ? await ChatRoom.find({ studentId, isActive: true })
      : [];

    const result = allExperts.map(expert => {
      // Check if this student already has an active room with this expert
      const existingRoom = activeRooms.find(r => r.expertId.toString() === expert._id.toString());
      
      let chatUrl, fullUrl;
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const serverUrl = process.env.SERVER_URL || 'https://scholarsync-chat-uh1x.onrender.com';

      if (existingRoom) {
        // Direct to existing session containing chat history
        chatUrl = `/chat/${existingRoom.roomId}`;
        fullUrl = `${clientUrl}${chatUrl}`;
      } else {
        // Direct to backend redirect endpoint that will lazily create the room ONLY when clicked
        chatUrl = `/api/connect/redirect?subject=${expert.subject}${studentId ? `&studentId=${studentId}` : ''}`;
        fullUrl = `${serverUrl}${chatUrl}`;
      }

      return {
        roomId: existingRoom ? existingRoom.roomId : null,
        chatUrl,
        fullUrl,
        expert: {
          name: expert.name,
          subject: expert.subjectLabel,
          description: expert.description,
          isOnline: expert.isOnline,
        }
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get All Experts error:', error);
    res.status(500).json({ message: 'Server error fetching experts' });
  }
};

module.exports = { connectUser, getAllExperts, connectAndRedirect };
