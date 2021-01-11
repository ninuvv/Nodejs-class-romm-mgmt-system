require('dotenv').config();
var express = require('express');
var router = express.Router();
var studentHelper = require("../Helpers/studentHelper")
const app = require('express')()
const bodyParser = require('body-parser')
var unirest = require('unirest');
const nunjucks = require('nunjucks')
const Nexmo = require('nexmo');

// Middleware for body parsing
const parseUrl = express.urlencoded({ extended: false })
const parseJson = express.urlencoded({ extended: false })

const https = require('https')

// const parseUrl = express.urlencoded({ extended: false });
// const parseJson = express.json({ extended: false });

nunjucks.configure('views', { express: app })

//const checksum_lib = require("../Paytm/checksum");
const config = require("../Paytm/config");
const checksum_lib = require("../Paytm/checksum");


const qs = require("querystring")

var request = require('request')
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AchVszw-1FREdlesGyC9xOzbHjg8reNyQJ7irjC3YrUYh1C8LFfkRVLxx6asBXVu1wufk2aIrT8K5WlZ',
  'client_secret': 'ENmBkt2LbND7QA4QrAhs1yz9CS8EiuOaPzukt4bEyj63cbs8Dc-NiQM-MiwpK15bgVfx9Pk60m-_u-tb'
});

let EventAmount = 0;
let ORDERID = 0
let STUDENTDETAILS

// var CLIENT = 'AZL-_YT7grhsBWqp49Bf3dpOn6hrSdLZ4_xX9BIN0--f9T9xSm2D1iEOf4N0WQmwn4MKiRdNBFyCISbu';
// var SECRET = 'EBkrvbyi0t30akiw-wyEbYjqGaInrgyBI00UXMebvYrfYkmxmM_0AV21jeWMaWg9C9XFDDv686GweW6J';
// var PAYPAL_API = 'https://api.sandbox.paypal.com';



// console.log(process.env.token);
// TOKEN:process.env.token
const port = process.env.token
// console.log(`Your port is ${port}`);
// `Your port is ${port}`

const nexmo = new Nexmo({
  apiKey: '6de2e27f',
  apiSecret: 'zL1PccyARFVhLaDB',
});

/* GET users listing. */

const verifyLogin = (req, res, next) => {
  if (req.session.student) { next() }
  else { res.redirect("/student") }
}


router.get("/", function (req, res) {
  if (req.session.student) {
    console.log("session is there ")
    res.redirect('student/studentHome')
  } else {
    res.render('student/studentLogin', { "loginErr": req.session.stdLoginErr });
    req.session.stdloginErr = false;
  }

})



router.post('/studentLogin', (req, res) => {
  studentHelper.studentLogin(req.body).then(async (response) => {
    if (response.status) {
      req.session.student = response.student;
      req.session.student.loggedin = true;
      let annoucements = await studentHelper.loadAnnoucements()
      let events = await studentHelper.loadEvents()
      res.render('student/studentHome', { student: true, studentDetails: req.session.student, annoucements, events })

    } else {
      req.session.stdLoginErr = "Invalid user name and password";
      res.redirect('/student')

    }
  })
})

router.get('/studentlogout', verifyLogin, (req, res) => {
  req.session.student.loggedin = false
  req.session.student = null
  res.redirect('/student')
})

router.get('/s_viewProfile', verifyLogin, (req, res) => {
  res.render('student/s_viewProfile', { student: true, studentDetails: req.session.student })
})



router.get('/s_Assignments', verifyLogin, async (req, res) => {
  //  let studentDetails= req.session.student
  // console.log("Id"+req.session.student._id)
  let topic = await studentHelper.getTopic()
  let assignments = await studentHelper.loadAssignment(req.session.student._id)
  res.render('student/s_Assignments', { student: true, studentDetails: req.session.student, topic, assignments })
})

router.post("/s_Assignments", verifyLogin, (req, res) => {

  studentHelper.addAttendence(req.body).then((attendId) => {
    let q = req.files.assignmentfile.name.toString()
    let exttype = q.split('.')[1]
    studentHelper.addStudentAssignment(req.body, req.files.assignmentfile.name, attendId).then((id) => {
      let image = req.files.assignmentfile
      image.mv('./public/studentsAssignments/' + attendId + '.' + exttype)
      res.redirect('/student/s_Assignments')
    })
  })

  // let q = req.files.assignmentfile.name.toString()
  // let exttype = q.split('.')[1]
  // studentHelper.addStudentAssignment(req.body, req.files.assignmentfile.name).then((id) => {
  //   let image = req.files.assignmentfile
  //   image.mv('./public/studentsAssignments/' + req.body.assginId+q)
  //   res.redirect('/student/s_Assignments')
  // })
})

router.get("/s_delAssignment/:attendId", verifyLogin, function (req, res) {
  let assgnId = req.params.attendId
  // console.log(assgnId)
  studentHelper.delStudentAssignment(assgnId, req.session.student._id).then((data) => {
    res.redirect("/student/s_Assignments")
  })
})

router.get('/s_taskView', verifyLogin, async (req, res) => {
  let notes = await studentHelper.getNotes()
  let TaskAssignment = await studentHelper.TaskAssignment()
  res.render('student/s_taskView', { student: true, studentDetails: req.session.student, notes, TaskAssignment })
})

router.get('/s_archeivefile', verifyLogin, async (req, res) => {
  // let notes = await studentHelper.getNotesArcheive()
  let TaskAssignment = await studentHelper.TaskAssignmentArcheive()
  res.render('student/s_archeivefile', { student: true, studentDetails: req.session.student, TaskAssignment })
})

router.get('/s_archeivenotes', verifyLogin, async (req, res) => {
  let notes = await studentHelper.getNotesArcheive()
  // let TaskAssignment = await studentHelper.TaskAssignmentArcheive()
  res.render('student/s_archeivenotes', { student: true, studentDetails: req.session.student, notes })
})

router.post('/markAttendence', (req, res) => {
  studentHelper.markAttendence(req.body).then((response) => {
    // console.log(response)
    res.json(response)
  })

})


router.get('/studentHome', verifyLogin, async (req, res) => {
  let annoucements = await studentHelper.loadAnnoucements()
  let events = await studentHelper.loadEvents()
  res.render('student/studentHome', { student: true, studentDetails: req.session.student, annoucements, events })
})

router.get('/s_loadAnnoucements', verifyLogin, async (req, res) => {
  let annoucements = await studentHelper.loadAnnoucements()
  res.render('student/s_loadAnnoucements', { student: true, studentDetails: req.session.student, annoucements })
})

router.get("/s_loadEvent/:eventId", verifyLogin, async (req, res) => {
  let eventId = req.params.eventId
  let eventDetails = await studentHelper.eventDetails(eventId)
  let Done = "A"
  // console.log(req.session.student._id + '  ' + eventId)
  let present = await studentHelper.payementDoneOrNot(req.session.student._id, eventId)
  // console.log(Done)
  // console.log(present)
  if (present.length > 0) {
    Done = "P"
  }
  // console.log(Done)
  res.render('student/s_loadEvent', { student: true, studentDetails: req.session.student, eventDetails, Done })
})



router.get("/s_annoucementDetails/:annoucementId", verifyLogin, async (req, res) => {
  let AnnId = req.params.annoucementId
  // console.log(AnnId)
  let annoucementDetails = await studentHelper.annoucementDetails(AnnId)
  // console.log(annoucementDetails)
  res.render('student/s_annoucementDetails', { student: true, studentDetails: req.session.student, annoucementDetails })
})


router.get('/s_Attendence', verifyLogin, async (req, res) => {
  let present = 0
  let average = 0
  let respose = {}
  studentHelper.getPresentCount(req.session.student._id, "01", "2019").then((totalcount) => {
    // respose.totalcount=totalcount
    // console.log(respose.totalcount)
    if (Object.keys(totalcount).length === 0) {

    } else {
      present = totalcount[0].count
      average = (present / 10) * 100
    }
    res.render('student/s_attendence', { student: true, studentDetails: req.session.student, present, average })
  })

})

router.post('/getAttendence', async (req, res) => {
  //  studentHelper.getPresentCount(req.body.studId,req.body.month,req.body.year).then((response) => {
  studentHelper.loadSingleStudentAttendence(req.body.studId, req.body.month, req.body.year).then((response) => {
//console.log("sdsad"+response[1])
    res.json(response)
    
  })


})


router.get('/s_photos', verifyLogin, async (req, res) => {
  let photos = await studentHelper.getPhotos()
  // let TaskAssignment = await studentHelper.TaskAssignmentArcheive()
  res.render('student/s_photos', { student: true, studentDetails: req.session.student, photos })
})

//#####################################################################

router.post("/verifyPayment", async (req, res) => {
  // console.log(req.body)
  studentHelper.verifyPayment(req.body).then((response) => {
    studentHelper.updatePaidStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })


  }).catch((err) => {
    console.log(err)
    res.json({ status: false, errMsg: '' })
  })
})




router.get("/s_orderSuccess", verifyLogin, async (req, res) => {

  res.render("student/s_orderSuccess", { student: true, studentDetails: req.session.student })

})


router.post('/s_paidStudentEvent', verifyLogin, async (req, res) => {
  let present = studentHelper.payementDoneOrNot(req.body.studId, req.body.eventId)
  if (present) {
    res.json("Already Paid for this Event")
  } else {
    studentHelper.addPaidStudentEvent(req.body).then((orderId) => {
      // console.log("req.body.method" + req.body.method)
      // console.log("req.body.amount" + req.body.amount)
      if (req.body.method === 'razorpay') {
        studentHelper.generateRazorpayOrder(orderId, req.body.amount).then((response) => {
          res.json(response)
        })
      }
      else {

      }
    })
  }

})




router.post('/s_payPal', verifyLogin, async (req, res) => {

  // console.log("req.body.method" + req.body.method)
  // console.log("req.body.amount" + req.body.amount)
  EventAmount = req.body.amount

  studentHelper.addPaidStudentEvent(req.body).then((orderId) => {
    ORDERID = orderId
    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://157.245.101.127/student/paypalsuccess",
        "cancel_url": "http://157.245.101.127/student/s_paypalcancel"

      },
      "transactions": [{
        "item_list": {
          "items": [{
            "name": "Red Sox Hat",
            "sku": "001",
            "price": req.body.amount,
            "currency": "INR",
            "quantity": 1

          }]
        },
        "amount": {
          "currency": "INR",
          "total": req.body.amount
        },
        "description": "Event Regeristation."
      }]
    };


    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        //  console.log(payment)
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {

            res.redirect(payment.links[i].href);

          }
        }
      }
    });
  })


})

router.get('/paypalsuccess', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "INR",
        "total": EventAmount
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      studentHelper.updatePaidStatus(ORDERID).then(() => {
        res.render("student/s_orderSuccess", { student: true, studentDetails: req.session.student })
        //  res.send('payment sucess')
      })


    }
  });
});


router.get('/s_paypalcancel', (req, res) => {
  res.render('student/s_paypalcancel', { student: true, studentDetails: req.session.student })
})


router.post('/s_paytm', [parseUrl, parseJson], (req, res) => {
  studentHelper.addPaidStudentEvent(req.body).then((orderId) => {
    ORDERID = orderId
    // console.log(req.body)
    STUDENTDETAILS = req.session.student
    // Route for making payment

    var paymentDetails = {
      amount: req.body.amount,
      customerId: STUDENTDETAILS._id,
      customerEmail: STUDENTDETAILS.email,
      customerPhone: STUDENTDETAILS.mob
    }
    if (!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
      res.status(400).send('Payment failed')
    } else {
      var params = {};
      params['MID'] = config.PaytmConfig.mid;
      params['WEBSITE'] = config.PaytmConfig.website;
      params['CHANNEL_ID'] = 'WEB';
      params['INDUSTRY_TYPE_ID'] = 'Retail';
      params['ORDER_ID'] = 'TEST_' + new Date().getTime();
      params['CUST_ID'] = 'customer_001';
      params['TXN_AMOUNT'] = req.body.amount.toString();
      params['CALLBACK_URL'] = 'http://157.245.101.127/student/callback';
      params['EMAIL'] = paymentDetails.customerEmail;
      params['MOBILE_NO'] = paymentDetails.customerPhone.toString();



      checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
        var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

        var form_fields = "";
        for (var x in params) {
          form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
        }
        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
        res.end();
      });

    }
  })


})



router.post('/callback', (req, res) => {
  var body = '';

  // console.log(req.body)

  // req.on('data', function (data) {
  //   body += data;
  // });

  // req.on('end', function () {
  var html = "";
  var post_data = req.body//qs.parse(body);

  // received params in callback
  console.log('Callback Response: ', post_data, "\n");


  // verify the checksum
  var checksumhash = post_data.CHECKSUMHASH;

  console.log("checksum" + checksumhash)
  // delete post_data.CHECKSUMHASH;
  var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
  console.log("Checksum Result => ", result, "\n");



  // Send Server-to-Server request to verify Order Status
  var params = { "MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID };

  checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

    params.CHECKSUMHASH = checksum;
    post_data = 'JsonData=' + JSON.stringify(params);

    var options = {
      hostname: 'securegw-stage.paytm.in', // for staging
      // hostname: 'securegw.paytm.in', // for production
      port: 443,
      path: '/merchant-status/getTxnStatus',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length
      }
    };

    console.log(options)
    // Set up the request
    var response = "";
    var post_req = https.request(options, function (post_res) {
      post_res.on('data', function (chunk) {
        response += chunk;
      });

      post_res.on('end', function () {
        console.log('S2S Response: ', response, "\n");

        var _result = JSON.parse(response);
        if (_result.STATUS == 'TXN_SUCCESS') {
          // res.send('payment sucess')
          req.session.student =STUDENTDETAILS;
          req.session.student.loggedin = true;

          studentHelper.updatePaidStatus(ORDERID).then(() => {
            res.render("student/s_orderSuccess", { student: true, studentDetails: STUDENTDETAILS })
            //  res.send('payment sucess')
          })
        } else {
          res.render('student/s_paypalcancel', { student: true, studentDetails: STUDENTDETAILS })
        }

      });
    });

    post_req.write(post_data);
    post_req.end();



  });
  // });
})

router.post('/execute-payment/', async (req, res) => {
  // 2. Get the payment ID and the payer ID from the request body.
  console.log(req.body);
  var paymentID = req.body.paymentID;
  var payerID = req.body.payerID;

  // 3. Call /v1/payments/payment/PAY-XXX/execute to finalize the payment.
  request.post(PAYPAL_API + '/v1/payments/payment/' + paymentID +
    '/execute',
    {
      auth:
      {
        user: CLIENT,
        pass: SECRET
      },
      body:
      {
        payer_id: payerID,
        transactions: [
          {
            amount:
            {
              total: '10',
              currency: 'USD'
            }
          }]
      },
      json: true
    },
    function (err, response) {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      // 4. Return a success response to the client
      res.json(
        {
          status: 'success'
        });
    });
});

router.post("/create-payment", verifyLogin, async (req, res) => {
  studentHelper.addPaidStudentEvent(req.body).then((orderId) => {

    request.post(PAYPAL_API + '/v1/payments/payment',
      {
        auth:
        {
          user: CLIENT,
          pass: SECRET
        },
        body:
        {
          intent: 'sale',
          payer:
          {
            payment_method: 'paypal'
          },
          transactions: [
            {
              amount:
              {
                total: '10',
                currency: 'USD'
              }
            }],
          redirect_urls:
          {
            return_url: 'https://example.com',
            cancel_url: 'https://example.com'
          }
        },
        json: true
      }, function (err, response) {
        if (err) {
          console.error(err);
          return res.sendStatus(500);
        }
        // 3. Return the payment ID to the client
        res.json(
          {
            id: response.body.id
          });
      });


  })
})



router.get('/chatRoom', function (req, res, next) {
  res.render('chatRoom', { student: true, studentDetails: req.session.student });
});


//***************************************************************************** */
router.get('/s_forgetPassword', (req, res) => {
  res.render('student/s_forgetPassword', { "otpLoginErr": req.session.otpLoginErr })
})

router.post('/s_verifyPassword', function (req, res) {
  studentHelper.geOTP(req.body.mob).then((response) => {
    req.session.requestId = response.otp_id
    req.session.stdId = response.studentId
    if (response.status) {
      res.render('student/s_checkOTP')
    } else {
      req.session.otpLoginErr = "Invalid Mobile Number";
      res.redirect("/student/s_forgetPassword")
    }

  })
});

router.get('/s_checkOTP', (req, res) => {
  res.render('student/s_checkOTP', { "otpLoginErr": req.session.otpLoginErr })
})

router.post('/s_checkOTP', function (req, res) {
  studentHelper.verifyOTP(req.session.requestId, req.body.code).then((response) => {
    console.log("status" + response.status)
    if (response.status == 'success') {
      studentHelper.getstudent(req.session.stdId).then(async (response) => {
        if (response.status) {
          req.session.student = response.student;
          req.session.student.loggedin = true;
          let annoucements = await studentHelper.loadAnnoucements()
          let events = await studentHelper.loadEvents()
          res.render('student/studentHome', { student: true, studentDetails: req.session.student, annoucements, events })

        } else {
          req.session.otpLoginErr = "login failed";
          res.redirect('/student/s_checkOTP')

        }

      })

    } else {
      req.session.otpLoginErr = "Invalid OTP Number";
      res.redirect('/student/s_checkOTP')

    }

  })

})



// router.post('/s_verifyPassword', function (req, res) {

//   nexmo.verify.request({
//     number: req.body.mob,
//     brand: 'Vonage',
//     code_length: '4'
//   }, (err, result) => {
//     console.log(err ? err : result)
//     if (result.status != 0) {
//       res.redirect('/student/s_verifyPassword', { message: result.error_text })
//       // res.render('index.html', { message: result.error_text })
//     } else {
//       res.render('student/s_checkOTP', { requestId: result.request_id })
//       // res.render('check.html', { requestId: result.request_id })
//     }
//   });



// })
// router.post('/s_checkOTP', function (req, res) {


//   nexmo.verify.check({
//     request_id: req.body.requestId,
//     code: req.body.code
//   }, (err, result) => {
//     // console.log(err ? err : result)
//     if(result.status != 0) {
//       res.redirect('/student/s_verifyPassword',{ message: result.error_text })
//       // res.render('index.html, { message: result.error_?ext })
//     } else {
//       res.render('student/studentHome')
//       // res.render('success.html')
//     }


//   });

// })

module.exports = router;
