$(document).ready(function() {

	$("#result-success").hide();
	$("#result-error").hide();

	$('#verify').on('click', function (e) {
		$("#result-success").hide();
		$("#result-error").hide();
		$("#result-error ul").empty();
		e.preventDefault();
		$.post( "/answers", $( "#verifyform" ).serialize())
		.done( function(result) {
			if(result.verify){
				$("#result-success").show();
				$('#verifyform').find("input[type=text], textarea").val("");
			}
			else{
				$("#result-error").show();
				for (var i = 0; i < result.bad.length; i++)
					$("#result-error ul").append('<li>'+result.bad[i]+'</li>');
			}

		});

	})
});
