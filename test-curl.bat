@echo off
echo Testing Resend with Curl...
echo.

curl -X POST "https://api.resend.com/emails" ^
  -H "Authorization: Bearer re_GpWZHnFQ_4fAdnU7npeqWGnst9AGf7LNU" ^
  -H "Content-Type: application/json" ^
  -d "{\"from\": \"RemBG <kbhatt@testemail.gostudio.dev>\", \"to\": [\"maheshkamalakar1@gmail.com\"], \"subject\": \"RemBG Curl Test\", \"html\": \"<p><strong>It works!</strong></p>\", \"reply_to\": \"maheshkamalakar1@gmail.com\"}"

echo.
echo.
echo Done! Check maheshkamalakar1@gmail.com inbox
pause
