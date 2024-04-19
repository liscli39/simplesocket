const socketio = require('socket.io');
const redisClient = require('./redis-client');

exports.initsocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    const socket_id = socket.id;

    socket.on('login', async (login_id) => {
      await redisClient.MULTI()
        .HSET(login_id, 'online', '1')
        .HSET(login_id, 'socket_id', socket_id)
        .HSET('user_socket', socket_id, login_id)
        .EXEC();

      const data = await redisClient.HGETALL(login_id);
      socket.emit('get_user', data);
    });

    socket.on('disconnect', async () => {
      const result = await redisClient.HGET('user_socket', socket_id);
      await redisClient.HSET(result, 'online', '0');
    });

    socket.on('get_user', async (login_id) => {
      const data = await redisClient.HGETALL(login_id);
      socket.emit('get_user', data);
    });

    // -----------------
    socket.on("rpc", async (req) => {
      // call o day
      if (typeof req !== "object" || typeof req.f !== "string") {
        socket.emit("rpc_ret", {
          seq: req.seq,
          err: 400,
          ret: "invalid rpc req",
        });
        return;
      }

      if (req.f == 'login') {
        await redisClient.MULTI()
          .HSET(login_id, 'online', '1')
          .HSET(login_id, 'socket_id', socket_id)
          .HSET('user_socket', socket_id, login_id)
          .EXEC();

        const data = await redisClient.HGETALL(login_id);
        socket.emit("rpc_ret", {
          seq: req.seq,
          err: err,
          ret: data,
        });
      }
    });
  });
}
