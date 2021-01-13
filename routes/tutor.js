const { response } = require('express');
var express = require('express');
var router = express.Router();
var tutorHelper = require("../Helpers/tutorHelper")
var _ = require('lodash');
const path = require('path')
const fs = require('fs');

const verifyLogin = (req, res, next) => {
  // console.log("verify" + req.session.tutor)
  if (req.session.tutor) { next() }
  else { res.redirect("/tutor") }
}


/* GET home page. */
router.get("/", function (req, res) {
  if (req.session.tutor) {
    // res.render('tutor/tutorLogin')
    res.redirect('tutor/tutorHome')
  } else {

    res.render('tutor/tutorLogin', { "loginErr": req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
  // res.render('tutor/tutorLogin')
})



router.post('/tutorLogin', (req, res) => {
  tutorHelper.Login(req.body).then(async (response) => {
    if (response.status) {
      req.session.tutor = response.tutor;
      req.session.tutor.loggedin = true;
      let annoucements = await tutorHelper.loadAnnoucements()
      let events = await tutorHelper.loadEvents()

      res.render('tutor/tutorHome', { tutor: true, tutorDetails: req.session.tutor, annoucements, events })
    } else {
      req.session.userLoginErr = "Invalid user name and password";
      res.redirect('/tutor')

    }
  })
})


router.get("/tutorHome", verifyLogin, async (req, res) => {
  let annoucements = await tutorHelper.loadAnnoucements()
  let events = await tutorHelper.loadEvents()
  res.render('tutor/tutorHome', { tutor: true, tutorDetails: req.session.tutor, annoucements, events })
})

router.get("/t_viewAnnoucementDetails/:annoucementId", verifyLogin, async (req, res) => {
  let AnnId = req.params.annoucementId
  // console.log(AnnId)
  let annoucementDetails = await tutorHelper.annoucementDetails(AnnId)
  // console.log(annoucementDetails)
  res.render('tutor/t_viewAnnoucementDetails', { tutor: true, tutorDetails: req.session.tutor, annoucementDetails })
})


router.get('/tutorlogout', verifyLogin, (req, res) => {
  console.log("logout")
  // req.session.destroy();
  req.session.tutor.loggedin = false
  req.session.tutor = null
  res.redirect('/tutor')
})

router.get("/t_Annoucements", verifyLogin, async (req, res) => {
  let annoucement = await tutorHelper.loadAnnoucements()
  res.render('tutor/t_Annoucements', { tutor: true, tutorDetails: req.session.tutor, annoucement })

})

router.post("/t_Annoucements", verifyLogin, (req, res) => {

  // if (!req.files || Object.keys(req.files).length === 0) {
  //   return res.status(400).send("Multiple files were uploaded.");
  // }

  // if (Object.keys(req.files).length !=3) {
  //   return res.status(400).send("3 files have to uploaded.");

  // }
  let pdffilename = ''
  let imagefilename = ''
  let videofilename = ''

  if (req.files) {
    if (req.files.loadedPdfFile) {
      pdffilename = req.files.loadedPdfFile.name
    }
    if (req.files.loadedImageFile) {
      imagefilename = req.files.loadedImageFile.name
    }
    if (req.files.loadedvideoFile) {
      videofilename = req.files.loadedvideoFile.name
    }
  }

  tutorHelper.addAnnoucements(req.body, pdffilename, imagefilename, videofilename).then((result) => {


    if (req.files) {
      let pdffile = req.files.loadedPdfFile
      let imagefile = req.files.loadedImageFile
      let videofile = req.files.loadedvideoFile


      if (pdffile) {
        pdffile.mv('./public/annoucementsPdf/' + result + '.' + 'pdf')
      }
      if (imagefile) {
        let q = req.files.loadedImageFile.name.toString()
        let exttype = q.split('.')[1]
        imagefile.mv('./public/annoucementsImage/' + result + '.' + 'jpg')
      }
      if (videofile) {
        videofile.mv('./public/annoucementsVideo/' + result + '.' + 'mp4')
      }
    }


    res.redirect("/tutor/t_Annoucements")

  })

})
router.get("/t_delAnnoucement/:annoId", verifyLogin, function (req, res) {
  let annoId = req.params.annoId
  // console.log(annoId)
  tutorHelper.deleteAnnoucement(annoId).then((data) => {
    res.redirect("/tutor/t_Annoucements")
  })
})





router.get("/tutorProfile", verifyLogin, function (req, res) {
  if (req.session.tutor) {
    tutorHelper.tutorDetails(req.session.tutor._id).then((tutorDetails) => {
      // console.log(tutorDetails)
      res.render('tutor/tutorProfile', { tutor: true, tutorDetails })
    })
  }
  else {
    res.render('tutor/tutorProfile', { tutor: true, tutorDetails: req.session.tutor })
  }


})

router.post("/tutorProfile/:tutorId", (req, res) => {
  tutorHelper.UpdatetutorDetsils(req.params.tutorId, req.body).then(() => {
    id = req.params.tutorId
    if (req.files) {
      let image = req.files.Image
      image.mv('./public/profile_photo/' + id + '.jpg')
      // res.render('tutor/tutorhome', { tutor: true,  tutorDetails: req.session.tutor })

      // res.redirect("/tutor/tutorProfile")
    }
    res.redirect("/tutor/tutorhome")
  })
})


router.get("/t_viewStudents", verifyLogin, function (req, res) {
  tutorHelper.getallStudents().then((students) => {
    res.render('tutor/t_viewStudents', { students, tutor: true, tutorDetails: req.session.tutor })

  })

})


router.get("/t_addStudent", verifyLogin, function (req, res) {
  res.render('tutor/t_addStudent', { tutor: true, tutorDetails: req.session.tutor })
})

router.post("/t_addStudent", async (req, res) => {
  let REGNO = await tutorHelper.RegistrationNumber()
  tutorHelper.addStudent(req.body, REGNO).then((result) => {
    let image = req.files.Image
    // console.log("exttt"+path.extname(req.files.Image.toString() )  )
    let q = req.files.Image.name.toString()

    let exttype = q.split('.')[1]

    //  console.log("wwww"+exttype)
    image.mv('./public/profile_photo/' + result + '.' + 'jpg', (err, done) => {
      if (!err) res.redirect('/tutor/t_viewStudents')
      else console.log(err)
    })

  })
})


router.get("/t_editStudent/:studId", verifyLogin, async (req, res) => {
  let student = await tutorHelper.editStudentDetails(req.params.studId);
  res.render('tutor/t_editStudent', { student, tutor: true, tutorDetails: req.session.tutor })
})

router.post("/t_editStudent/:studId", (req, res) => {
  tutorHelper.UpdateStudent(req.params.studId, req.body).then(() => {
    id = req.params.studId
    if (req.files) {
      let image = req.files.Image
      let q = req.files.Image.name.toString()

      let exttype = q.split('.')[1]

      image.mv('./public/profile_photo/' + id + '.' + 'jpg')
    }
    res.redirect('/tutor/t_viewStudents')
  })
})

router.get("/t_deletestudent/:studId", verifyLogin, function (req, res) {
  let studId = req.params.studId
  // console.log(studId)
  tutorHelper.deleteStudent(studId).then((data) => {
    // console.log(data)
    res.redirect("/tutor/t_viewStudents")
  })
})

router.get("/t_Assignments", verifyLogin, async (req, res) => {
  let assignments = await tutorHelper.loadAssignment()
  res.render('tutor/t_Assignments', { tutor: true, tutorDetails: req.session.tutor, assignments })
})

router.post("/t_Assignments", (req, res) => {
  let q = req.files.assignmentfile.name.toString()
  let exttype = q.split('.')[1]

  tutorHelper.addAssignment(req.body, req.files.assignmentfile.name).then((id) => {
    let image = req.files.assignmentfile
    image.mv('./public/assignments/' + id + '.' + exttype)
    res.redirect('/tutor/t_Assignments')
  })
})

router.get("/t_delAssignment/:assgnId", verifyLogin, function (req, res) {
  let assgnId = req.params.assgnId
  // console.log(assgnId)
  tutorHelper.deleteAssignment(assgnId).then((data) => {
    res.redirect("/tutor/t_Assignments")
  })
})

router.get("/t_Note", verifyLogin, async (req, res) => {
  let notes = await tutorHelper.loadNotes()
  res.render('tutor/t_Note', { tutor: true, tutorDetails: req.session.tutor, notes })
})

router.post("/t_Note", (req, res) => {

  // if (!req.files || Object.keys(req.files).length === 0 ||  Object.keys(req.files).length === 1) {
  //   return res.status(400).send("Multiple files were uploaded.");
  // }

  let filename = ''
  let videoname = ''
  videoname = req.files.video.name

  if (req.files.notes) {

    filename = req.files.notes.name

  }


  tutorHelper.addNotes(req.body, filename, videoname).then((id) => {

    let video = req.files.video
    video.mv('./public/notevideo/' + id + '.' + 'mp4')
    if (req.files.notes) {
      let image = req.files.notes
      image.mv('./public/notefile/' + id + '.' + 'pdf')

    }

    res.redirect('/tutor/t_Note')
  })
})
router.get("/t_delNotes/:noteId", verifyLogin, function (req, res) {
  let noteId = req.params.noteId
  tutorHelper.deleteNote(noteId).then((data) => {
    res.redirect("/tutor/t_Note")
  })
})
router.get("/t_studentAssignments/:studId", verifyLogin, async (req, res) => {
  let studId = req.params.studId
  // console.log("studeId" + studId)
  let student = await tutorHelper.getstudent(studId)
  // console.log("student" + student)
  let assignments = await tutorHelper.getStudentAssignments(studId)
  let attendence = await tutorHelper.getstudentAttendence(studId)
  res.render("tutor/t_studentAssignments", { tutor: true, tutorDetails: req.session.tutor, assignments, student, attendence })

})

router.get("/t_attendence", verifyLogin, async (req, res) => {
  let attdate = new Date().toLocaleDateString()
  // console.log(attdate)
  // let loadStudents = await  tutorHelper.studentsAttendece(attdate)
  let loadStudents = await tutorHelper.loadStudents();
  // console.log(loadStudents)
  // console.log("loadStudents" + loadStudents)
  // let loadpresentStudents = await tutorHelper.loadpresentStudents(attdate);
  // let resp = {}
  // resp.pre = loadpresentStudents
  // console.log("present" + resp.pre)
  res.render('tutor/t_attendence', { tutor: true, tutorDetails: req.session.tutor, loadStudents, attdate })
})



router.post('/loadStudentAttendence', (req, res) => {
  // console.log(new Date(req.body.changedate))
  tutorHelper.studentsAttendece(new Date(req.body.changedate)).then((response) => {
    // console.log("details" + response)
    // res.render('tutor/t_attendence', { tutor: true, tutorDetails: req.session.tutor, response })
    res.json(response)
  })

})


router.get("/t_photos", verifyLogin, function (req, res) {
  res.render('tutor/t_photos', { tutor: true, tutorDetails: req.session.tutor })
})

router.post("/t_photos", function (req, res) {

  // let q = req.files.assignmentfile.name.toString()
  // let exttype = q.split('.')[1]
  tutorHelper.addPhoto(req.body).then((result) => {
    let data = req.body.image

    let image_array_1 = data.split(';')[1] //explode(";", data);
    // console.log(image_array_1)

    let image_array_2 = image_array_1.split(",")[1]//explode(",", image_array_1[1]);
    // console.log(image_array_2)

    //     let data = 'c3RhY2thYnVzZS5jb20=';
    // let buff = new Buffer(data, 'base64');
    // let text = buff.toString('ascii');
    data = Buffer.from(image_array_2, 'base64');
    fs.writeFileSync('./public/photos/' + result + '.png', data)

    res.json(data)


  })
})

router.get("/t_Event", verifyLogin, function (req, res) {
  res.render('tutor/t_Event', { tutor: true, tutorDetails: req.session.tutor })
})


router.post("/t_Event", verifyLogin, function (req, res) {
  let pdffilename = ''
  let imagefilename = ''
  let videofilename = ''

  if (!req.body.amount) {
    req.body.amount = 0
  }

  // console.log("body",req.body)
  // console.log("file",req.files)
  if (req.files) {
    if (req.files.loadedPdfFile) {
      pdffilename = req.files.loadedPdfFile.name
    }
    if (req.files.loadedImageFile) {
      imagefilename = req.files.loadedImageFile.name
    }
    if (req.files.loadedvideoFile) {
      videofilename = req.files.loadedvideoFile.name
    }
  }

    tutorHelper.addEvent(req.body, pdffilename, imagefilename, videofilename).then((result) => {

    if (req.files) {
      let pdffile = req.files.loadedPdfFile
      let imagefile = req.files.loadedImageFile
      let videofile = req.files.loadedvideoFile


      if (pdffile) {
        pdffile.mv('./public/PDFfiles/' + result + '.' + 'pdf')
      }
      if (imagefile) {
        let q = req.files.loadedImageFile.name.toString()
        let exttype = q.split('.')[1]
        imagefile.mv('./public/Imagefiles/' + result + '.' + 'jpg')
      }
      if (videofile) {
        videofile.mv('./public/Videofiles/' + result + '.' + 'mp4')
      }
    }

    res.json(true)
  })

})


router.get("/t_loadEvent/:eventId", verifyLogin, async (req, res) => {
  let eventId = req.params.eventId
  // console.log(eventId)
  let eventDetails = await tutorHelper.eventDetails(eventId)
  // console.log(eventDetails)
  res.render('tutor/t_loadEvent', { tutor: true, tutorDetails: req.session.tutor, eventDetails })
})





router.post("/verifyPayment", async (req, res) => {
  // console.log(req.body)
  tutorHelper.verifyPayment(req.body).then((response) => {
    tutorHelper.updateSponserStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })


  }).catch((err) => {
    console.log(err)
    res.json({ status: false, errMsg: '' })
  })
})



router.get("/t_sponsership/:eventId", verifyLogin, async (req, res) => {
  let eventId = req.params.eventId
  // console.log("eventId" + eventId)
  // let eventDetails = await tutorHelper.eventDetails(eventId)
  res.render("tutor/t_sponsership", { tutor: true, tutorDetails: req.session.tutor, eventId })

})

router.get("/t_orderSuccess", verifyLogin, async (req, res) => {

  res.render("tutor/t_orderSuccess", { tutor: true, tutorDetails: req.session.tutor })

})


router.post('/t_sponsership', verifyLogin, async (req, res) => {
  tutorHelper.addSponsership(req.body).then((orderId) => {
    // console.log("req.body.method" + req.body.method)
    // console.log("req.body.amount" + req.body.amount)
    if (req.body.method === 'razorpay') {
      tutorHelper.generateRazorpayOrder(orderId, req.body.amount).then((response) => {
        res.json(response)
      })
    } else {
      // res.json({ status: true })
    }

  })
})




router.get('/t_registeredStudents', async (req, res, next) => {
  let events = await tutorHelper.eventLoad()
  res.render('tutor/t_registeredStudents', { tutor: true, tutorDetails: req.session.tutor, events });
});

router.post('/t_loadregisteredStudents', async (req, res, next) => {
  // console.log("eventId"+req.body.eventId)
 tutorHelper.eventLoadStudents(req.body.eventId).then((response)=>{
  //console.log(response)
  res.json(response)
  })



});


module.exports = router;
