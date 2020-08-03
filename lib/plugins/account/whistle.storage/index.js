
const { Pool } = require('socketx');
const { encode } = require('simpleproto');
const crc23 = require('crc32');

const NON_UID_RE = /[^\w.-]/;

exports.resStatsServer = (server, { data: { storageServer } }) => {
  const len = storageServer && storageServer.length;
  if (!len) {
    return;
  }
  const pool = new Pool();
  server.on('request', (req) => {
    const uid = req.headers['x-whistle-nohost-storage-uid'];
    if (NON_UID_RE.test(uid)) {
      return;
    }
    req.getSession(async (s) => {
      if (s) {
        const index = len > 1 ? crc23(uid) % len : 0;
        try {
          const socket = await pool.connect(storageServer[index]);
          socket.write(encode(s));
        } catch (e) {}
      }
    });
  });
};