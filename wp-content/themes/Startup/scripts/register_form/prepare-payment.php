<!DOCTYPE html>
<html>
<head>
<title>Redirect to payment gateway</title>
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache">
</head>
<body>
Redirect to payment gateway...<br>
<form name="payment" id="payment" method="post" action="https://esqa.moneris.com/HPPDP/index.php">
<input type="hidden" name="ps_store_id" value="DFCU2tore1"> 
<input type="hidden" name="hpp_key" value="hpMNHJZLHCSL">
<?php
$breaktags = array("<br>", "<BR>");
$divtags = array("</div>", "</DIV>");
$divopentags = array("<div class=`sessionHeader`>", "<DIV class=sessionHeader>");

$part1_0 = str_replace($breaktags, "\r\n",$_POST['step6CampSessionConfirmText0']);
$part1_0 = str_replace($divtags, "\r\n", $part1_0);
$part1_0 = strip_tags($part1_0);
$part1_1 = str_replace($breaktags, "\r\n",$_POST['step6CampSessionConfirmText1']);
$part1_1 = str_replace($divtags, "\r\n", $part1_1);
$part1_1 = strip_tags($part1_1);
$part1_2 = str_replace($breaktags, "\r\n",$_POST['step6CampSessionConfirmText2']);
$part1_2 = str_replace($divtags, "\r\n", $part1_2);
$part1_2 = strip_tags($part1_2);
$part1_3 = str_replace($breaktags, "\r\n",$_POST['step6CampSessionConfirmText3']);
$part1_3 = str_replace($divtags, "\r\n", $part1_3);
$part1_3 = strip_tags($part1_3);
$part1_4 = str_replace($breaktags, "\r\n",$_POST['step6CampSessionConfirmText4']);
$part1_4 = str_replace($divtags, "\r\n", $part1_4);
$part1_4 = strip_tags($part1_4);
$part2 = str_replace($breaktags, "\r\n",$_POST['step6BusTransportationConfirmText']);
$part2 = strip_tags($part2);
$part3 = str_replace($breaktags, "\r\n",$_POST['step6ActivitiesConfirmText']);
$part3 = str_replace($divtags, "\r\n", $part3);
$part3 = str_replace($divopentags, "", $part3);
$part4 = str_replace($breaktags, "\r\n",$_POST['step6CamperInfoConfirmText']);
$part4 = strip_tags($part4);
$part5 = str_replace($breaktags, "\r\n",$_POST['step6HealthInfoConfirmText']);
$part5 = strip_tags($part5);
$part6 = str_replace($breaktags, "\r\n",$_POST['step6ParentInfoConfirmText']);
$part6 = strip_tags($part6);

$separator = "---------------------------------------";
$part2 = ($part2 == "" ? "" : $separator."\r\nBus Transportation:\r\n".$part2."\r\n");

$toinfo = 'info@campceltic.ca';
$toIvan  = 'ivan.kolev@gmail.com';
$toFabio = 'fabio.gallo@gmail.com';
$toScott = 'scott@scottmcfadyen.com';
$toGeoff = 'higeoffyates@hotmail.com';
$subject = 'Online Registration Submission';
$message = "Session Information:\r\n".$part1_0."\r\n".$part1_1."\r\n".$part1_2."\r\n".$part1_3."\r\n".$part1_4
	."\r\n".$part2.$separator.
	"\r\nActivities:\r\n".$part3."\r\n".$separator.
	"\r\nCamper Information:\r\n".$part4."\r\n".$separator.
	"\r\nHealth Information:\r\n".$part5.$separator.
	"\r\nParent Information:\r\n".$part6;
$headers = 'From: webmaster@campceltic.ca' . "\r\n" .
	'Reply-To: info@campceltic.ca' . "\r\n" .
	'X-Mailer: PHP/' . phpversion();

$confirmSubject = "Camp Celtic - We've received your registration";

$confirmMessage = "Thank you for registering for camp at Camp Celtic. After we review your registration we'll contact
you with an invoice email and all the information you need to make the most of Camp Celtic. If we have any questions
or concerns we may call you directly. If you would like to speak to us please don't hesitate to call or email.
Our contact information is at the bottom of this email."."\r\n\r\n"."
Below is the information we received from you. Please double check this and contact us if there are any errors or omissions.
"."\r\n"."
See you soon!"."\r\n\r\n".$separator."\r\n".$message."\r\n".$separator."\r\n".
"Camp Celtic\r\n
248 Stokes Bay Road\r\n
Lion's Head, ON\r\n
N0H1W0\r\n
\r\n
519-793-3911\r\n
info@campceltic.ca\r\n
\r\n
\r\n
Since 1984 Camp Celtic has created thousands of fantastic camp experiences\r\n
for kids from throughout Ontario and around the world.";
$confirmEmail = $_POST["step5Email1"];

mail($confirmEmail, $confirmSubject, $confirmMessage, $headers);
mail($toinfo, $subject, $message, $headers);
//mail($toIvan, $subject, $message, $headers);
//mail($toFabio, $subject, $message, $headers);
//mail($toScott, $subject, $message, $headers);
//mail($toGeoff, $subject, $message, $headers);

$charge_total = 0.0;
if(isset($_POST['cartItem']) && count($_POST['cartItem']) > 0) {
	$items = $_POST['cartItem'];
	$i = 1;
	foreach($items as $item) {
		list($desc, $price) = split('\|', $item);
		$charge_total += floatval($price);
		//echo "\n<input type=\"hidden\" name=\"id$i\" value=\"item$i\">";
		echo "\n<input type=\"hidden\" name=\"description$i\" value=\"$desc\">";
		echo "\n<input type=\"hidden\" name=\"quantity$i\" value=\"1\">";
		echo "\n<input type=\"hidden\" name=\"price$i\" value=\"".number_format($price, 2, '.', '')."\">";
		echo "\n<input type=\"hidden\" name=\"subtotal$i\" value=\"".number_format($price, 2, '.', '')."\">";
		$i++;
	}
}
$hst = $charge_total * 1.13 - $charge_total;
echo "\n<input type=\"hidden\" name=\"hst\" value=\"".number_format($hst, 2, '.', '')."\">";
$charge_total_hst = $charge_total * 1.13;
echo "\n<input type=\"hidden\" name=\"charge_total\" value=\"".number_format($charge_total_hst, 2, '.', '')."\">";
echo "\n<input type=\"hidden\" name=\"cust_id\" value=\"online\">";
echo "\n<input type=\"hidden\" name=\"email\" value=\"$confirmEmail\">";
$note = htmlentities('Booking for '.$_POST['step3FirstName'].' '.$_POST['step3LastName'].' ('.$_POST['step3group1'].', '.$_POST['step3DateOfBirth'].')', ENT_COMPAT, "ISO-8859-1");
echo "\n<input type=\"hidden\" name=\"note\" value=\"$note\">";
echo "\n<input type=\"hidden\" name=\"bill_first_name\" value=\"".htmlentities($_POST['step5FirstName1'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"bill_last_name\" value=\"".htmlentities($_POST['step5LastName1'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"bill_address_one\" value=\"".htmlentities($_POST['step3Address1'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"bill_city\" value=\"".htmlentities($_POST['step3City'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"bill_state_or_province\" value=\"".htmlentities($_POST['step3Province'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"bill_postal_code\" value=\"".htmlentities($_POST['step3PostalCode'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"bill_country\" value=\"".htmlentities($_POST['step3Country'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"bill_phone\" value=\"".htmlentities($_POST['step5HomeTelephone1'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"ship_first_name\" value=\"".htmlentities($_POST['step5FirstName1'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"ship_last_name\" value=\"".htmlentities($_POST['step5LastName1'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"ship_address_one\" value=\"".htmlentities($_POST['step3Address1'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"ship_city\" value=\"".htmlentities($_POST['step3City'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"ship_state_or_province\" value=\"".htmlentities($_POST['step3Province'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"ship_postal_code\" value=\"".htmlentities($_POST['step3PostalCode'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"ship_country\" value=\"".htmlentities($_POST['step3Country'], ENT_COMPAT, "ISO-8859-1")."\">";
echo "\n<input type=\"hidden\" name=\"ship_phone\" value=\"".htmlentities($_POST['step5HomeTelephone1'], ENT_COMPAT, "ISO-8859-1")."\">";
?>
<input type="submit" name="redirect" id="redirect" style="display:none;" value="Manual redirect"> 
</form> 
<pre style="display:none;"><?php print_r($_POST);?></pre>
<script type="text/javascript">
window.onload = function() {
	document.forms['payment'].submit();

	var dummy = setTimeout(function() {
		document.getElementById("redirect").style.display = "block";
	}, 5000);
}
</script>
</body>
</html>