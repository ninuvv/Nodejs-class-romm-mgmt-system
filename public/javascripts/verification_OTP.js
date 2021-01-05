function sendOTP() {
    $(".error").html("").hide();
    var number = $('#mob').val();
    if (number.length == 10 && number != null) {
       
        $.ajax({
            url: '/s_forgetPassword',
            type:'POST',
        data:{
            "mobile_number": number,
            "action": "send_OTP"

        },
            success:function(respose){
                alert("suuccess");
            }

        })
    }else{
        $(".error").html("Pease enter valid data")
        $(".error").show();
    }

}