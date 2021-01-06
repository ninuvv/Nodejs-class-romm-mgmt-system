
var db = require("../config/connection")
var collection = require("../config/collection")
var bcrypt = require("bcrypt")
const { ResumeToken } = require("mongodb")
const { response } = require("express")
var ObjId = require("mongodb").ObjectID
var Razorpay = require("razorpay")
var instance = new Razorpay({
    key_id: 'rzp_test_ADHuiXSjzRk327',
    key_secret: 'AYEUuSiiG5nOLEykeeAJemfT',
});
module.exports = {

    Login: (tutordata) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}

            let tutor = await db.get().collection(collection.TUTOR_COLLECTIONS).
                findOne({ $and: [{ username: tutordata.username }, { password: tutordata.password }] })
            if (tutor) {
                response.tutor = tutor;
                response.status = true;

                resolve(response)

            } else {
                console.log("login failed")
                resolve({ status: false })
            }


        })
    },

    registerHelper: ("setChecked", function (value, currentValue) {
        if (value == currentValue) {
            return "checked";
        } else {
            return "";
        }
    }),

    RegistrationNumber: () => {
        return new Promise(async (resolve, reject) => {
            let number = await db.get().collection(collection.STUDENT_COLLECTION).countDocuments()
            number = number + 1
            var result = ""
            for (var i = 4 - number.toString().length; i > 0; i--) {
                result += "0"
            }
            let regno = "STUD21" + result + number
            resolve(regno)
        })

    },

    addAnnoucements: (details, pdffilename, imagefilename, videofilename) => {
        return new Promise((resolve, reject) => {
            details.pdffilename = pdffilename,
                details.imagefilename = imagefilename,
                details.videofilename = videofilename,
                details.createdDate = new Date()
            db.get().collection(collection.ANNOUCEMENTS_COLLECTION).insertOne(details).then((data) => {

                resolve(data.ops[0]._id)
            })
        })

    },

    addEvent: (details, pdffilename, imagefilename, videofilename) => {
        return new Promise((resolve, reject) => {
            details.pdffilename = pdffilename
            details.imagefilename = imagefilename
            details.videofilename = videofilename
            details.amount = parseInt(details.amount)
            db.get().collection(collection.EVENT_COLLECTION).insertOne(details).then((data) => {
                // console.log(data.ops[0]._id)
                resolve(data.ops[0]._id)
            })
        })

    },
    tutorDetails: (tutorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TUTOR_COLLECTIONS).findOne({ _id: ObjId(tutorId) }).then((tutor) => {
                resolve(tutor)
            })
        })


    },
    UpdatetutorDetsils: (tutorId, tutorDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TUTOR_COLLECTIONS)
                .updateOne({ _id: ObjId(tutorId) }, {
                    $set: {
                        name: tutorDetails.name,
                        address: tutorDetails.address,
                        job: tutorDetails.job,
                        class: tutorDetails.class,
                        email: tutorDetails.email,
                        mob: tutorDetails.mob
                    }
                }).then((resp) => {
                    resolve()
                })
        })
    },



    addStudent: (student, regno) => {

        return new Promise(async (resolve, reject) => {
            student.del_status = false
            student.password = await bcrypt.hash(student.password, 10)
            student.regno = regno
            db.get().collection(collection.STUDENT_COLLECTION).insertOne(student).then((data) => {
                resolve(data.ops[0]._id)
            })

        })


    },



    getallStudents: () => {
        return new Promise(async (resolve, reject) => {
            let students = await db.get().collection(collection.STUDENT_COLLECTION).find({ 'del_status': false }).toArray();
            // console.log("details" + students)
            resolve(students)
        })
    },

    deleteStudent: (studId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION)
                .updateOne({ _id: ObjId(studId) }, {
                    $set: {
                        del_status: true
                    }
                }).then((resp) => {
                    resolve(resp)
                })

        })
    },
    editStudentDetails: (studId) => {
        return new Promise(async (resolve, reject) => {
            let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ _id: ObjId(studId) })
            resolve(student)
        })
    },
    UpdateStudent: (studId, studDetails) => {
        return new Promise(async (resolve, reject) => {
            studDetails.password = await bcrypt.hash(studDetails.password, 10)
            db.get().collection(collection.STUDENT_COLLECTION)
                .updateOne({ _id: ObjId(studId) }, {
                    $set: {
                        first_name: studDetails.first_name,
                        last_name: studDetails.last_name,
                        address: studDetails.address,
                        mob: studDetails.mob,
                        email: studDetails.email,
                        password: studDetails.password
                    }
                }).then((resp) => {
                    resolve()
                })
        })
    },

    addAssignment: (details, fileName) => {

        return new Promise(async (resolve, reject) => {
            details.date = new Date()
            details.fileName = fileName
            db.get().collection(collection.ASSIGNMENT_COLLECTION).insertOne(details).then((data) => {
                resolve(data.ops[0]._id)
            })

        })


    },
    loadAssignment: () => {
        return new Promise(async (resolve, reject) => {
            let assignments = await db.get().collection(collection.ASSIGNMENT_COLLECTION).find().toArray();
            resolve(assignments)
        })
    },

    loadAnnoucements: () => {
        return new Promise(async (resolve, reject) => {
            let annoucements = await db.get().collection(collection.ANNOUCEMENTS_COLLECTION).find().toArray();
            resolve(annoucements)
        })
    },
    loadEvents: () => {
        return new Promise(async (resolve, reject) => {
            let events = await db.get().collection(collection.EVENT_COLLECTION).find().toArray();
            resolve(events)
        })
    },

    annoucementDetails: (annoucementId) => {
        // console.log("annouid" + annoucementId)
        return new Promise(async (resolve, reject) => {
            let annoucements = await db.get().collection(collection.ANNOUCEMENTS_COLLECTION).find({ _id: ObjId(annoucementId) }).toArray();
            resolve(annoucements)
        })
    },
    deleteAnnoucement: (annoId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ANNOUCEMENTS_COLLECTION).removeOne({ _id: ObjId(annoId) }).then((data) => {
                resolve(data)
            })

        })
    },

    deleteAssignment: (assignId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ASSIGNMENT_COLLECTION).removeOne({ _id: ObjId(assignId) }).then((data) => {
                resolve(data)
            })

        })
    },
    addNotes: (details, fileName, videoNmae) => {

        return new Promise(async (resolve, reject) => {
            details.date = new Date()
            details.fileName = fileName
            details.videoNmae = videoNmae
            db.get().collection(collection.NOTE_COLLECTION).insertOne(details).then((data) => {
                resolve(data.ops[0]._id)
            })

        })


    },

    loadNotes: () => {
        return new Promise(async (resolve, reject) => {
            let assignments = await db.get().collection(collection.NOTE_COLLECTION).find().toArray();
            resolve(assignments)
        })
    },
    deleteNote: (noteId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.NOTE_COLLECTION).removeOne({ _id: ObjId(noteId) }).then((data) => {
                resolve(data)
            })

        })
    },
    getstudent: (studentId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION).findOne({ _id: ObjId(studentId) }).then((student) => {
                resolve(student)
            })

        })
    },
    // getstudentAttendence: (studentId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let studentsattendece = await db.get().collection(collection.MARK_ATTENDENCE).aggregate([
    //             { $match: { "studId": ObjId(studentId) } },
    //             { $sort: { "watchedDate": -1 } }

    //         ]).toArray()
    //         resolve(studentsattendece)

    //     })
    // },
    getstudentAttendence: (studId) => {

        let month = new Date().getMonth()
        let year = new Date().getFullYear()
        // let day = parseInt(new Date().getUTCDate())
        let day = new Date().getDate()

        return new Promise(async (resolve, reject) => {

            let array = []

            for (let ii = 0; ii <= 6; ii++) {
                let stdetails = {}
                var date = new Date(Date.UTC(year, month, day - ii))
                // let date = new Date(year, month, ii)
                //let checkingdate = moment(date).format("MM/DD/YYYY");
                checkingdate = date.toLocaleDateString()
                //console.log( checkingdate)
                stdetails.date1 = checkingdate

                let attExist = await db.get().collection(collection.STUDENT_COLLECTION).findOne({
                    $and: [{ _id: ObjId(studId) },
                    { "attendence.attenddate": { $eq: checkingdate } }]
                })
                // console.log(attExist)
                if (attExist) {
                    stdetails.status = "P"
                } else {
                    stdetails.status = "A"
                }
                array.push(stdetails)

            }

            resolve(array)
        })
    },

    getStudentAssignments: (stud_Id) => {
        return new Promise(async (resolve, reject) => {
            let assCollection = await db.get().collection(collection.STUDENTASSIGNMENT_COLLECTION).aggregate([
                { $match: { studId: ObjId(stud_Id) } },
                { $unwind: '$assignments' },
                {
                    $project: {
                        attendId: '$assignments.attendId',
                        assgnId: '$assignments.assgnId',
                        submitDate: '$assignments.submitDate',
                        fileName: '$assignments.fileName'
                    }
                },
                {
                    $lookup: {
                        from: collection.ASSIGNMENT_COLLECTION,
                        localField: 'assgnId',
                        foreignField: '_id',
                        as: 'assignName'

                    }
                },
                // {
                //     $project: { assgnId: 1, fileName: 1, assignment: { $arrayElemAt: ['$assignments', 1] } }
                // }

            ]).toArray()
            // console.log("ass1" + assCollection)
            // console.log(studentAssginmentcollection[0].assignment)
            resolve(assCollection)
        })

    },
    loadStudents: () => {
        return new Promise(async (resolve, reject) => {
            let student = await db.get().collection(collection.STUDENT_COLLECTION).find().toArray();
            resolve(student)


        })
    },
    studentsAttendece: (changedate) => {
        changedate = changedate.toLocaleDateString()
        console.log(changedate)
        return new Promise(async (resolve, reject) => {

            let data = await db.get().collection(collection.STUDENT_COLLECTION).aggregate([

                { $match: { "attendence.attenddate": { $nin: [changedate] } } },
                { $project: { first_name: 1, _id: 0, regno: 1, status: "A" } },
                {
                    $unionWith: {
                        coll: "students", pipeline: [{ $match: { "attendence.attenddate": { $eq: changedate } } },
                        { $project: { first_name: 1, _id: 0, regno: 1, status: "P" } }]
                    }
                },
                { $sort: { first_name: 1 } }


            ]).toArray()
            resolve(data)

            //    let d1= await db.get().collection(collection.MARK_ATTENDENCE).find({"_id" : ObjId("5fdb51113e451f43b0357401")},{watchedDate:1,_id:0}).toArray()

            //    console.log("dbdate1"+d1)
            //    let  cc=new Date().toLocaleDateString(undefined,{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',})
            //    console.log("cc"+new Date())
            //    console.log("newdate to local"+new Date().toLocaleDateString())
            //    console.log("changedate"+changedate.toLocaleDateString())

            // let studentsattendeceList = await db.get().collection(collection.MARK_ATTENDENCE).aggregate([
            //            {$lookup: {
            //                   from: "students",
            //                   localField:"studId",           
            //                 foreignField:"_id",
            //                     as: 'attendencedetails'
            //                     }
            //            }
            //              , { $replaceRoot: { newRoot: { $mergeObjects: [ {$arrayElemAt:["$attendencedetails",0]},"$$ROOT" ]} } }
            //         , {$project:{_id:0,studId:1,watchedDate:1,first_name:1,regno:1 }  }
            //         ,{"$match":{watchedDate:{"$gte": new Date(changedate.setHours(00,00,00)),  
            //                                   "$lt" :  new Date(changedate.setHours(23,59,59))}}}


            //     ]).toArray()


        })
    },

    loadpresentStudents: (changedate) => {

        return new Promise(async (resolve, reject) => {
            let presentstudent = await db.get().collection(collection.MARK_ATTENDENCE).aggregate([

                {
                    "$match": {
                        watchedDate: {
                            "$gte": new Date(changedate.setHours(00, 00, 00)),
                            "$lt": new Date(changedate.setHours(23, 59, 59))
                        }
                    }
                },
            ]).toArray()

            console.log("load" + presentstudent)
            resolve(presentstudent)
        })
    },

    addPhoto: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PHOTO_COLLECTION).insertOne(details).then((data) => {
                // console.log(data.ops[0]._id)
                resolve(data.ops[0]._id)
            })
        })

    },
    eventDetails: (eventtId) => {
        console.log("eventtId" + eventtId)
        return new Promise(async (resolve, reject) => {
            let events = await db.get().collection(collection.EVENT_COLLECTION).find({ _id: ObjId(eventtId) }).toArray();
            resolve(events)
        })
    },
    addSponsership: (details) => {
        return new Promise(async (resolve, reject) => {
            details.date = new Date()
            db.get().collection(collection.SPONSERSHIP_COLLECTION).insertOne(details).then((data) => {
                resolve(data.ops[0]._id)
            })

        })


    },
    generateRazorpayOrder: (orderId, amount) => {
        return new Promise(async (resolve, reject) => {
            var options = {
                amount: amount * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                console.log("new Order " + order);
                resolve(order)
            });
        })

    },
    verifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'AYEUuSiiG5nOLEykeeAJemfT');
            hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex');
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })

    },

    updateSponserStatus: (orderId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.SPONSERSHIP_COLLECTION).updateOne({ _id: ObjId(orderId) },
                { $set: { "status": "success" } }).then((data) => {
                    resolve()
                })
        })
    },

    eventLoad: () => {
        return new Promise(async (resolve, reject) => {
            let event = await db.get().collection(collection.EVENT_COLLECTION).find({ amount: { $gt: 0 } }).toArray();
            resolve(event)
        })
    },

    eventLoadStudents: (eventId) => {
        return new Promise(async (resolve, reject) => {
            let event = await db.get().collection(collection.PAID_COLLECTION).aggregate([
                // {$match:{"eventId" :ObjId(eventId)}},
                { $match: { $and: [{ "status": "success" }, { "eventId": ObjId(eventId) }] } },
                {
                    $lookup:
                    {
                        from: "students",
                        localField: "studId",
                        foreignField: "_id",
                        as: "student"
                    }
                }
                , { $unwind: "$student" }
                , { $project: { method: 1, amount: 1, date: 1, "student.first_name": 1 } }
            ]).toArray();

            //   console.log(event)
            resolve(event)
        })
    },


}