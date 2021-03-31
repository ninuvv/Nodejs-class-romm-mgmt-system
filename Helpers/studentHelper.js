
var db = require("../config/connection")
var collection = require("../config/collection")
var bcrypt = require("bcrypt")
const { ResumeToken } = require("mongodb")
const { reject } = require("lodash")
var ObjId = require("mongodb").ObjectID
var request = require('request')
var unirest = require('unirest');
var https = require('follow-redirects').https;
var fs = require('fs');
require('dotenv').config()
var moment = require('moment');
const { Console } = require("console")
var Razorpay = require("razorpay")
var instance = new Razorpay({
    key_id: 'rzp_test_ADHuiXSjzRk327',
    key_secret: 'AYEUuSiiG5nOLEykeeAJemfT',
});
module.exports = {


    studentLogin: (studentdata) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let student = await db.get().collection(collection.STUDENT_COLLECTION).
                findOne({ first_name: studentdata.first_name })
            // console.log(student)
            // findOne({ $or: [{ first_name: studentdata.first_name },{regno:studentdata.first_name}] })                    
            if (student) {
                bcrypt.compare(studentdata.password, student.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.student = student;
                        response.status = true;
                        resolve(response)
                    }
                    else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })

            } else {
                console.log("login failed")
                resolve({ status: false })
            }
        })
    },

    getTopic: () => {
        return new Promise(async (resolve, reject) => {
            let topic = await db.get().collection(collection.ASSIGNMENT_COLLECTION).find({}).toArray()
            // console.log(order)
            resolve(topic)
        })
    },

    loadAssignment: (stud_Id) => {
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
    addAttendence: (details, regno) => {

        return new Promise(async (resolve, reject) => {
            details.status = 'P',
                details.assginId = ObjId(details.assginId),
                details.studId = ObjId(details.studId),
                details.subdate = new Date(),
                db.get().collection(collection.ATTENDENCE_COLLECTION).insertOne(details).then((data) => {
                    resolve(data.ops[0]._id)
                })

        })


    },
    addStudentAssignment: (details, fileName, AttendId) => {
        return new Promise(async (resolve, reject) => {
            let AssObj = {
                attendId: ObjId(AttendId),
                assgnId: ObjId(details.assginId),
                submitDate: new Date(),
                fileName: fileName
            }
            let studentAssignment = await db.get().collection(collection.STUDENTASSIGNMENT_COLLECTION).findOne({ studId: ObjId(details.studId) })
            if (studentAssignment) {
                db.get().collection(collection.STUDENTASSIGNMENT_COLLECTION)
                    .updateOne(
                        { studId: ObjId(details.studId) },
                        { $push: { assignments: AssObj } }
                    ).then((data) => {
                        resolve()
                    })

            } else {
                let studentAssignmentObj = {
                    studId: ObjId(details.studId),
                    assignments: [AssObj]
                }
                db.get().collection(collection.STUDENTASSIGNMENT_COLLECTION).insertOne(studentAssignmentObj).then((data) => {
                    resolve()
                })
            }
        })


    },
    delStudentAssignment: (attendId, studId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENTASSIGNMENT_COLLECTION)
                .updateOne(
                    { studId: ObjId(studId) },
                    { $pull: { assignments: { attendId: ObjId(attendId) } } }

                ).then((response) => {
                    db.get().collection(collection.ATTENDENCE_COLLECTION).removeOne({ _id: ObjId(attendId) }).then((data) => {
                        resolve(data)
                    })

                    resolve()
                })

        })
    },

    geOTP: (MobileNo) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ mob: MobileNo })
            if (student) {

                response.student = student;
                // resolve({ studentId:response.student._id,  status: true }) 

                var req = unirest('POST', 'https://d7networks.com/api/verifier/send')
                    .headers({
                        'Authorization': `Token ${process.env.token}`
                    })
                    .field('mobile', '91' + MobileNo)
                    .field('sender_id', 'SMSINFO')
                    .field('message', 'Your otp code is {code}')
                    .field('expiry', '900')
                    .end(function (res) {
                        if (res.error) {
                            resolve({ err: res.error, status: false })
                        } else {


                            resolve({ studentId: response.student._id, otp_id: res.body.otp_id, status: true })
                        }

                    });

            }
            else {
                console.log("Invalid Mobile Number")
                resolve({ status: false })
            }
        })
    },
    verifyOTP: (reqId, code) => {
        return new Promise(async (resolve, reject) => {

            var req = unirest('POST', 'https://d7networks.com/api/verifier/verify')
                .headers({
                    'Authorization': `Token ${process.env.token}`
                })
                .field('otp_id', reqId)
                .field('otp_code', code)
                .end(function (res) {
                    if (res.error) { resolve({ err: res.erroe, status: false }) };
                    resolve(res.body)


                });

        })
    },
    getstudent: (studentId) => {
        return new Promise(async (resolve, reject) => {
            let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ _id: ObjId(studentId) })
            if (student) {
                let response = {}

                response.student = student;
                response.status = true;
                resolve(response)

            } else {
                console.log("login failed")
                resolve({ status: false })
            }
        })
    },
    TaskAssignment: () => {
        return new Promise(async (resolve, reject) => {
            let newdate = new Date()
            newdate.setHours(0, 0, 0, 0)
            // console.log(new Date())

            let assignments = await db.get().collection(collection.ASSIGNMENT_COLLECTION).find({ date: { "$gte": newdate } }).toArray();
            resolve(assignments)
        })
    },

    TaskAssignmentArcheive: () => {
        return new Promise(async (resolve, reject) => {
            let newdate = new Date()
            newdate.setHours(0, 0, 0, 0)
            // console.log(new Date())
            let assignments = await db.get().collection(collection.ASSIGNMENT_COLLECTION).aggregate([
                { "$match": { date: { "$lte": newdate } } },
                { "$sort": { _id: -1 } }
            ]).toArray();


            // let assignments = await db.get().collection(collection.ASSIGNMENT_COLLECTION).find({date: {"$lte": newdate}}).toArray();
            resolve(assignments)
        })
    },


    getNotes: () => {
        return new Promise(async (resolve, reject) => {
            // let newdate=new Date()
            // newdate.setHours(0,0,0,0)
            // console.log(new Date())    


            let notes = await db.get().collection(collection.NOTE_COLLECTION).find({
                date: {
                    "$gte": new Date(new Date().setHours(00, 00, 00)),
                    "$lt": new Date(new Date().setHours(23, 59, 59))
                }
            }).toArray()
            // console.log(order)
            resolve(notes)
        })
    },


    getNotesArcheive: () => {
        return new Promise(async (resolve, reject) => {
            let newdate = new Date()
            newdate.setHours(0, 0, 0, 0)
            // console.log(new Date())    
            // let notes = await db.get().collection(collection.NOTE_COLLECTION).find({date: {"$gte": new Date().setHours(0,0,0,0)}}).toArray()

            let notes = await db.get().collection(collection.NOTE_COLLECTION).find({ date: { "$lte": newdate } }).toArray()
            // console.log(order)
            resolve(notes)
        })
    },

    markAttendence: (attendDetails) => {
        return new Promise(async (resolve, reject) => {
            // let watchedDate=new Date()
            // watchedDate.setHours(0,0,0,0)
            let Attendence = await db.get().collection(collection.MARK_ATTENDENCE).findOne(
                {
                    $and: [{
                        watchedDate: {
                            "$gte": new Date(new Date().setHours(00, 00, 00)),
                            "$lt": new Date(new Date().setHours(23, 59, 59))
                        },
                        studId: ObjId(attendDetails.studId)
                    }]
                })
            // $eq:new Date().toLocaleDateString()
            // "$gte": new Date(new Date().setHours(00,00,00)),  
            //                              "$lt" :  new Date(new Date().setHours(23,59,59))
            console.log(Attendence)
            if (!Attendence) {
                attendDetails.studId = ObjId(attendDetails.studId)
                attendDetails.watchedDate = new Date();
                db.get().collection(collection.MARK_ATTENDENCE).insertOne(attendDetails).then((data) => {
                    attendDetails.watchedDate = new Date().toLocaleDateString();
                    let attObj = {
                        attenddate: attendDetails.watchedDate,
                        present: 1
                    }

                    db.get().collection(collection.STUDENT_COLLECTION)
                        .updateOne(
                            { _id: attendDetails.studId },
                            { $push: { attendence: attObj } }
                        ).then((response) => {
                            resolve({ status: true })
                        })
                    // resolve({ status: true })
                })

            } else {

                resolve({ status: false })

            }
        })
    },

    getPresentCount: (studId, month1, year1) => {
        let month = parseInt(month1)
        let year = parseInt(year1)
        return new Promise(async (resolve, reject) => {
            console.log("studId" + month + year)
            let total = await db.get().collection(collection.MARK_ATTENDENCE).aggregate([
                { $match: { "studId": ObjId(studId) } },
                {
                    $project: {
                        _id: 0, studId: 1, watchedDate: 1,
                        "month": { $month: "$watchedDate" },
                        "year": { $year: "$watchedDate" }
                    }
                }
                , { $match: { $and: [{ "month": month }, { "year": year }] } }
                , { $group: { _id: null, count: { $sum: 1 } } }

            ]).toArray()

            console.log("ajaz" + total)
            resolve(total)
        })
    },

    loadSingleStudentAttendence: (studId, month1, year1) => {
        let month = parseInt(month1)
        let year = parseInt(year1)
        let present = 0
        let average = 0
        // let day = parseInt(new Date().getUTCDate())
        let day = new Date().getDate()
        let pMonth = new Date().getMonth() + 1
        let pYear = new Date().getFullYear()

        return new Promise(async (resolve, reject) => {


            if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) && (year != pYear)) {

                day = 31;
            }
            else if ((month == 4 || month == 6 || month == 9 || month == 11) && (year != pYear)) {

                day = 30;
            } else if (month == pMonth && year == pYear) {

                day = day;
            } else if (month == 2 && year == 2020) {

                day = 29;
            } else if (month == 2 && year == 2019) {

                day = 28;

            } else if (month > pMonth && year == pYear) {

                day = 0;
            }


            console.log("day" + day)
            let array = []
            let count=0

            let RESONSE = {}
            for (let ii = 1; ii <= day; ii++) {
                let stdetails = {}
                var date = new Date(Date.UTC(year, month - 1, ii))
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
                    count++;

                } else {
                    stdetails.status = "A"
                }
               
                array.push(stdetails)
                

            }
            let array2=[]
            // console.log(count)
            // console.log(day)
            let perc=Math.round((count/day)*100)
            array2.push(array)
            array2.push(perc)
            array2.push(count)
            // console.log(array2)
        
            resolve(array2)
        })
    },

    loadAnnoucements: () => {
        return new Promise(async (resolve, reject) => {
            let annoucements = await db.get().collection(collection.ANNOUCEMENTS_COLLECTION).find().sort({_id:-1}).toArray();
            resolve(annoucements)
        })
    },
    loadEvents: () => {
        return new Promise(async (resolve, reject) => {
            let events = await db.get().collection(collection.EVENT_COLLECTION).find().sort({_id:-1}).toArray();
            resolve(events)
        })
    },
    eventDetails: (eventtId) => {
        // console.log("eventtId" + eventtId)
        return new Promise(async (resolve, reject) => {
            let events = await db.get().collection(collection.EVENT_COLLECTION).find({ _id: ObjId(eventtId) }).toArray();
            resolve(events)
        })
    },

    getPhotos: () => {
        return new Promise(async (resolve, reject) => {
            let photos = await db.get().collection(collection.PHOTO_COLLECTION).find().toArray();
            resolve(photos)
        })
    },

    annoucementDetails: (annoucementId) => {
        // console.log("annouid" + annoucementId)
        return new Promise(async (resolve, reject) => {
            let annoucements = await db.get().collection(collection.ANNOUCEMENTS_COLLECTION).find({ _id: ObjId(annoucementId) }).toArray();
            resolve(annoucements)
        })
    },

    addPaidStudentEvent: (details) => {
        return new Promise(async (resolve, reject) => {
            details.date = new Date()
            details.studId = ObjId(details.studId),
                details.eventId = ObjId(details.eventId)
            db.get().collection(collection.PAID_COLLECTION).insertOne(details).then((data) => {
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

    updatePaidStatus: (orderId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PAID_COLLECTION).updateOne({ _id: ObjId(orderId) },
                { $set: { "status": "success" } }).then((data) => {
                    resolve()
                })
        })
    },

    // updatePaidStatusPaytmPal:(studId,eventId)=>{
    //     console.log(studId)
    //     console.log(eventId)

    //     return new Promise(async (resolve, reject) => {
    //         db.get().collection(collection.PAID_COLLECTION).updateOne({$and:[{studId:ObjId(studId)},{eventId:ObjId(eventId)}]},
    //                                                             {$set:{"status":"success"}}).then((data) => {
    //             resolve()
    //         })
    //     })  
    // },

    payementDoneOrNot: (studId, eventId) => {
        return new Promise(async (resolve, reject) => {
            let done = await db.get().collection(collection.PAID_COLLECTION).find({
                $and: [{ "status": "success" },
                { "studId": ObjId(studId) }, { "eventId": ObjId(eventId) }]
            }).toArray();
            resolve(done)
        })
    }




}
