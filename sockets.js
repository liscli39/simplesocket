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


      const key = `user_socketArray:${result}`;
      try {

       await redisClient.del(key);
      } catch (error) {
        console.error(error);
      }
      await redisClient.HSET(result, 'online', '0');
    });


    socket.on('end_login', async () => {



      const ipAddress = socket.handshake.address;

      const result = await redisClient.HGET('user_socket', socket_id).catch(err => {

      });


      const key = `user_socketArray:${result}`;
      try {

        await  redisClient.del(key);
      } catch (error) {
        console.error(error);
      }
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

      const key = `user_socketArray:${login_id}`;


      try {
        var titleIDArr = await redisClient.lRange(key, 0, -1);

        if (titleIDArr.indexOf(socket_id) != -1) {
          await redisClient.RPUSH(key, socket_id);

      
          console.log(socket_id);
          const veggies = await redisClient.lRange(key, 0, -1);
          veggies.forEach(v => console.log(v));
        }
      } catch (error) {
        console.error(error);
      }
      var titleIDArr = await redisClient.lRange(key, 0, -1);
      console.log(titleIDArr.length);

      if (titleIDArr.length > 1) {
        await redisClient.MULTI()
          .HSET(login_id, 'online', "1")
          .HSET(login_id, 'socket_id', socket_id)
          .HSET('user_socket', socket_id, login_id)
          .EXEC();
        data = await redisClient.HGETALL(login_id);

        socket.emit('get_user', data);
        console.log("duplicate");

        return;

      }
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