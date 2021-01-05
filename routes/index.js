var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/chatRoom/:id', function(req, res, next) {
  if (req.params.id==1)
      res.render('chatRoom',{ tutor: true, tutorDetails: req.session.tutor }); 
  else  
   res.render('chatRoom',{ student: true, studentDetails: req.session.student });
 
});

// router.get('/callback', (req, res) => {
//   let callbackResponse = ''

//   req.on('error', (err) => {
//     console.error(err.stack)
//   }).on('data', (chunk) => {
//     callbackResponse += chunk
//   }).on('end', () => {
//     let data = qs.parse(callbackResponse)
//     console.log(data)

//     data = JSON.parse(JSON.stringify(data))

//     const paytmChecksum = data.CHECKSUMHASH

//     var isVerifySignature = PaytmChecksum.verifySignature(data, PaytmConfig.PaytmConfig.key, paytmChecksum)
//     if (isVerifySignature) {
//       console.log("Checksum Matched");

//       var paytmParams = {};

//       paytmParams.body = {
//         "mid": PaytmConfig.PaytmConfig.mid,
//         "orderId": data.ORDERID,
//       };

//       PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PaytmConfig.PaytmConfig.key).then(function (checksum) {
//         paytmParams.head = {
//           "signature": checksum
//         };

//         var post_data = JSON.stringify(paytmParams);

//         var options = {

//           /* for Staging */
//           hostname: 'securegw-stage.paytm.in',

//           /* for Production */
//           // hostname: 'securegw.paytm.in',

//           port: 443,
//           path: '/v3/order/status',
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Content-Length': post_data.length
//           }
//         };

//         // Set up the request
//         var response = "";
//         var post_req = https.request(options, function (post_res) {
//           post_res.on('data', function (chunk) {
//             response += chunk;
//           });

//           post_res.on('end', function () {
//             console.log('Response: ', response);
//             res.write(response)
//             res.end()
//           });
//         });

//         // post the data
//         post_req.write(post_data);
//         post_req.end();
//       });
//     } else {
//       console.log("Checksum Mismatched");
//     }
//   })
// })

module.exports = router;
