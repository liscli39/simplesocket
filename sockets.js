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

    const ipAddress = socket.handshake.address;


    // console.log(`${user_socketArray}`);

    console.log("New connection from: " + ipAddress);

    socket.on('login', async (login_id) => {
      const valueLogin = "1";
      // const result = await redisClient.HGET('user_socket', socket_id);

      await redisClient.MULTI()
        .HSET(login_id, 'online', valueLogin)
        .HSET(login_id, 'socket_id', socket_id)
        .HSET('user_socket', socket_id, login_id)
        .EXEC();

      const data = await redisClient.HGETALL(login_id);


      console.log(`New login from title :${login_id}`);

      socket.emit('set_user', data);
    });

    socket.on('disconnect', async () => {
      const ipAddress = socket.handshake.address;

      // user_socketArray = [];

      const result = await redisClient.HGET('user_socket', socket_id);
      if (result == null) {
        return;
      }
      console.log(`disconnect from: ${ipAddress} - title id: ${result}`);

      await redisClient.HSET(result, 'online', '0');
    });


    socket.on('end_login', async () => {
      const ipAddress = socket.handshake.address;

      const result = await redisClient.HGET('user_socket', socket_id).catch(err => {

      });
      if (result == null) {
        return;
      }
      await redisClient.HSET(result, 'online', '0');

      const data = await redisClient.HGETALL(result);

      console.log(`endlogin from: ${ipAddress} - title id: ${result}`);
      // user_socketArray = [];

      socket.emit('end_login', data);

    });


    socket.on('get_user', async (login_id) => {
      var data = await redisClient.HGETALL(login_id);
      // var user_socketArray = redisClient.get("user_socketArray");

      // if (!user_socketArray.indexOf(socket_id) != -1) {
      //     // user_socketArray.push(socket_id);
      //     redisClient.a
      // }

      console.log("kakasdadasdsadakaka");

      // await redisClient.exists(`user_socketArray:${login_id}`, function(err, reply) {
      //   console.log("kakakaka");
      //   if (reply === 1) {
      //     console.log('Exists!');
      //   } else {
      //     console.log('Doesn\'t exist!');
      //   }
      // });

      try {
        const result =    await redisClient.rPush(`user_socketArray:${login_id}`, socket_id);
        console.log(result);

        var arrayData = await redisClient.get(`user_socketArray:${login_id}`);
        console.log(arrayData);

    } catch (error) {
        console.error(error);
    }

      // console.log(`user_socketArray length ${user_socketArray}`);
      // console.log(`user_socketArray count ${user_socketArray.length}`);

      // if (user_socketArray.length > 1) {
      //   console.log(`duplicate login ${user_socketArray}`);

      //   await redisClient.MULTI()
      //     .HSET(login_id, 'online', "1")
      //     .HSET(login_id, 'socket_id', socket_id)
      //     .HSET('user_socket', socket_id, login_id)
      //     .EXEC();
      //     data = await redisClient.HGETALL(login_id);

      //     socket.emit('get_user', data);

      //     return;
      // }

      if (!data['online']) {

        await redisClient.MULTI()
          .HSET(login_id, 'online', "0")
          .HSET(login_id, 'socket_id', socket_id)
          .HSET('user_socket', socket_id, login_id)
          .EXEC();

        data = await redisClient.HGETALL(login_id);

      }
      socket.emit('get_user', data);
    });


    socket.on('set_user', async (login_id, c) => {
      const data = await redisClient.HGETALL(login_id);
      socket.emit('set_user', data);
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