//Add Student


//     $('.addStud').ready(function(){

//         jQuery.validator.addMethod("phoneUS", function(mob, element) {
//             mob = mob.replace(/\s+/g, ""); 
//         return this.optional(element) || mob.length >13  &&
//         mob.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
//     }, "Please specify a valid phone number");

//     $('.addStud').validate({
//         rules: {
//             first_name: {
//                 required: true,
//                 minlength:4
//             },
//             mob:{
//                 required: true,
//                 matches:"[0-9]+",minlength:10, maxlength:14,
//                 // phoneUS:true
//             }

//         }

//     })
// })
$('.addStud').ready(function () {

    $('#first_name').blur(function () {
        var text = $(this).val();
        if (text.length < 4) {
            alert("Minimum 4 characters needed")
            return false
        }

    })
    // $('#mob').blur(function () {
    //     console.log("test")
    //     if (($(this).val().length < 10) || ($(this).val().length > 14)) {
    //         alert("phone number is less than 14 digit")
    //         return false
    //     }

    //     else { }
    // })
    $('.btn').click(function () {
      
            // var text = $('#first_name').val();
            // if (text.length < 4) {
            //     alert("Minimum 4 characters needed")
            //     return false
            // }
          
            //     if (($('#mob').val().length < 10) || ($('#mob').val().length > 14)) {
            //         alert("phone number is less than 14 digit")
            //         return false
            //     }
        
         
        
    })
})


//Add Assignment
// $('.assgin').ready(function () {
//     $('.btn').click(function () {
//         console.log("hello")
//     })
// })