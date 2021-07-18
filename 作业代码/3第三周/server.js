const http = require("http");

const server = http.createServer((req, res) => {
  console.log("request received");
  console.log(req.headers);
  res.setHeader("Content-Type", "text/html");
  res.setHeader("X-Foo", "bar");
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(`<html lang="en">
  <head>
    <style>
      body div #myid {
        width: 100px;
        background-color: #ff5000;
      }

      body div img {
        width: 30px;
        background-color: #ff1111;
      }
    </style>
  </head>
  <body>
    <div>
      <img id="myid"/>
      <img/>
    </div>
  </body>
</html>`);
});

server.listen(8080)
console.log('Server started!')
// var http = require("http");

// http
//   .createServer(function (request, response) {
//     let body = [];
//     request
//       .on("error", (err) => {
//         console.error(err);
//       })
//       .on("data", (chunk) => {
//         body.push(chunk.toString());
//       })
//       .on("end", () => {
//         console.log("body", body.toString());
//         response.writeHead(200, { "Content-Type": "text/html" });
//         response.end(" Hello world\n");
//       });
//   })
//   .listen(8080);

// console.log("server started");
