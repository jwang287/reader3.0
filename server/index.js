const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// In-memory storage
const books = [];
const bookSources = [];
const rssSources = [];
const chapters = {};

// Helper function to create response
const createResponse = (isSuccess, data, errorMsg = '') => ({
  isSuccess,
  data,
  errorMsg
});

// ========== Bookshelf APIs ==========

// Get bookshelf
app.get('/getBookshelf', (req, res) => {
  res.json(createResponse(true, books));
});

// Save book
app.post('/saveBook', (req, res) => {
  const book = req.body;
  const existingIndex = books.findIndex(b => b.bookUrl === book.bookUrl);
  if (existingIndex >= 0) {
    books[existingIndex] = { ...books[existingIndex], ...book };
  } else {
    books.push(book);
  }
  res.json(createResponse(true, 'Book saved successfully'));
});

// Delete book
app.post('/deleteBook', (req, res) => {
  const { bookUrl } = req.body;
  const index = books.findIndex(b => b.bookUrl === bookUrl);
  if (index >= 0) {
    books.splice(index, 1);
  }
  res.json(createResponse(true, 'Book deleted successfully'));
});

// Get chapter list
app.get('/getChapterList', (req, res) => {
  const { url } = req.query;
  const bookChapters = chapters[url] || generateChapters(url);
  chapters[url] = bookChapters;
  res.json(createResponse(true, bookChapters));
});

// Get book content
app.get('/getBookContent', (req, res) => {
  const { url, index } = req.query;
  const chapterIndex = parseInt(index);
  const content = generateChapterContent(url, chapterIndex);
  res.json(createResponse(true, content));
});

// Save book progress
app.post('/saveBookProgress', (req, res) => {
  const progress = req.body;
  console.log('Book progress saved:', progress);
  res.json(createResponse(true, 'Progress saved'));
});

// ========== Book Source APIs ==========

// Get all book sources
app.get('/getBookSources', (req, res) => {
  res.json(createResponse(true, bookSources));
});

// Save book source
app.post('/saveBookSource', (req, res) => {
  const source = req.body;
  const existingIndex = bookSources.findIndex(s => s.bookSourceUrl === source.bookSourceUrl);
  if (existingIndex >= 0) {
    bookSources[existingIndex] = source;
  } else {
    bookSources.push(source);
  }
  res.json(createResponse(true, 'Source saved successfully'));
});

// Save multiple book sources
app.post('/saveBookSources', (req, res) => {
  const sources = req.body;
  sources.forEach(source => {
    const existingIndex = bookSources.findIndex(s => s.bookSourceUrl === source.bookSourceUrl);
    if (existingIndex >= 0) {
      bookSources[existingIndex] = source;
    } else {
      bookSources.push(source);
    }
  });
  res.json(createResponse(true, bookSources));
});

// Delete book sources
app.post('/deleteBookSources', (req, res) => {
  const sources = req.body;
  sources.forEach(source => {
    const index = bookSources.findIndex(s => s.bookSourceUrl === source.bookSourceUrl);
    if (index >= 0) {
      bookSources.splice(index, 1);
    }
  });
  res.json(createResponse(true, 'Sources deleted successfully'));
});

// ========== RSS Source APIs ==========

// Get all RSS sources
app.get('/getRssSources', (req, res) => {
  res.json(createResponse(true, rssSources));
});

// Save RSS source
app.post('/saveRssSource', (req, res) => {
  const source = req.body;
  const existingIndex = rssSources.findIndex(s => s.sourceUrl === source.sourceUrl);
  if (existingIndex >= 0) {
    rssSources[existingIndex] = source;
  } else {
    rssSources.push(source);
  }
  res.json(createResponse(true, 'RSS source saved successfully'));
});

// Save multiple RSS sources
app.post('/saveRssSources', (req, res) => {
  const sources = req.body;
  sources.forEach(source => {
    const existingIndex = rssSources.findIndex(s => s.sourceUrl === source.sourceUrl);
    if (existingIndex >= 0) {
      rssSources[existingIndex] = source;
    } else {
      rssSources.push(source);
    }
  });
  res.json(createResponse(true, rssSources));
});

// Delete RSS sources
app.post('/deleteRssSources', (req, res) => {
  const sources = req.body;
  sources.forEach(source => {
    const index = rssSources.findIndex(s => s.sourceUrl === source.sourceUrl);
    if (index >= 0) {
      rssSources.splice(index, 1);
    }
  });
  res.json(createResponse(true, 'RSS sources deleted successfully'));
});

// ========== Read Config APIs ==========

// Get read config
app.get('/getReadConfig', (req, res) => {
  const config = {
    theme: 0,
    font: 0,
    fontSize: 18,
    readWidth: 800,
    infiniteLoading: false,
    customFontName: '',
    jumpDuration: 1000,
    spacing: {
      paragraph: 1,
      line: 0.8,
      letter: 0
    }
  };
  res.json(createResponse(true, JSON.stringify(config)));
});

// Save read config
app.post('/saveReadConfig', (req, res) => {
  console.log('Read config saved:', req.body);
  res.json(createResponse(true, 'Config saved successfully'));
});

// ========== Helper Functions ==========

function generateChapters(bookUrl) {
  const chapters = [];
  for (let i = 0; i < 100; i++) {
    chapters.push({
      url: `${bookUrl}/chapter/${i}`,
      title: `第${i + 1}章 示例章节`,
      isVolume: false,
      baseUrl: bookUrl,
      bookUrl: bookUrl,
      index: i,
      isVip: false,
      isPay: false
    });
  }
  return chapters;
}

function generateChapterContent(bookUrl, index) {
  return `第${index + 1}章 示例章节

这是示例书籍的第${index + 1}章内容。\n
在实际使用中，这里会显示从书源获取的真实章节内容。\n\n当前这是一个模拟后端服务，用于演示和测试前端界面功能。\n\n您可以：\n1. 浏览章节列表\n2. 切换章节\n3. 保存阅读进度\n4. 管理书源\n\n更多功能等待您的探索...\n\n（本内容为系统自动生成的示例文本）`;
}

// ========== WebSocket Server ==========

const wss = new WebSocket.Server({ server, path: '/searchBook' });

wss.on('connection', (ws) => {
  console.log('WebSocket connected for book search');
  
  ws.on('message', (message) => {
    try {
      const { key } = JSON.parse(message);
      console.log('Search key:', key);
      
      // Simulate search results
      const results = [
        {
          name: `搜索结果: ${key}`,
          author: '示例作者',
          bookUrl: `https://example.com/book/${Date.now()}`,
          coverUrl: '',
          intro: `这是关于"${key}"的示例书籍简介`,
          latestChapterTitle: '最新章节',
          tocUrl: '',
          origin: '示例书源',
          originName: '示例书源',
          type: 0,
          time: Date.now(),
          originOrder: 0,
          chapterWordCount: 1000,
          respondTime: 100
        }
      ];
      
      ws.send(JSON.stringify(results));
      
      // Close connection after sending results
      setTimeout(() => {
        ws.close();
      }, 1000);
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.close();
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
});

// Debug WebSocket
const debugWss = new WebSocket.Server({ server, path: '/bookSourceDebug' });

debugWss.on('connection', (ws) => {
  console.log('WebSocket connected for source debug');
  
  ws.on('message', (message) => {
    try {
      const { tag, key } = JSON.parse(message);
      console.log('Debug - tag:', tag, 'key:', key);
      
      // Send debug logs
      ws.send(`开始调试书源: ${tag}`);
      ws.send(`搜索关键词: ${key}`);
      ws.send('正在连接书源...');
      ws.send('获取搜索结果...');
      ws.send('找到 1 个结果');
      ws.send('调试完成');
      
      setTimeout(() => {
        ws.close();
      }, 2000);
    } catch (error) {
      console.error('Debug WebSocket error:', error);
      ws.close();
    }
  });
});

// RSS Debug WebSocket
const rssDebugWss = new WebSocket.Server({ server, path: '/rssSourceDebug' });

rssDebugWss.on('connection', (ws) => {
  console.log('WebSocket connected for RSS source debug');
  
  ws.on('message', (message) => {
    try {
      const { tag, key } = JSON.parse(message);
      ws.send(`开始调试RSS源: ${tag}`);
      ws.send(`搜索关键词: ${key}`);
      ws.send('调试完成');
      
      setTimeout(() => {
        ws.close();
      }, 2000);
    } catch (error) {
      console.error('RSS Debug WebSocket error:', error);
      ws.close();
    }
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Legado Server is running', version: '1.0.0' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Legado Server is running on port ${PORT}`);
  console.log(`HTTP API: http://localhost:${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
