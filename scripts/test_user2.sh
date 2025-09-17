#!/bin/zsh
set -e

API="http://localhost:3000"

echo "=== 1. Register new user ==="
REGISTER_RESPONSE=$(curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","username":"john","password":"Haslo123!"}')
echo $REGISTER_RESPONSE | jq .
if [[ $(echo $REGISTER_RESPONSE | jq -r .success) == "true" ]]; then
  echo "✅ Register new user: OK"
else
  echo "❌ Register new user: FAILED"
fi
echo

echo "=== 2. Try registering duplicate user (should fail) ==="
DUPLICATE_RESPONSE=$(curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","username":"john","password":"Haslo123!"}')
echo $DUPLICATE_RESPONSE | jq .
if [[ $(echo $DUPLICATE_RESPONSE | jq -r .success) == "false" ]]; then
  echo "✅ Duplicate user rejected: OK"
else
  echo "❌ Duplicate user accepted: FAILED"
fi
echo

echo "=== 3. Login user ==="
LOGIN_RESPONSE=$(curl -s -X POST $API/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"Haslo123!"}')
echo $LOGIN_RESPONSE | jq .
TOKEN=$(echo $LOGIN_RESPONSE | jq -r .data.token)
if [[ -n "$TOKEN" && "$TOKEN" != "null" ]]; then
  echo "✅ Login returned valid token"
else
  echo "❌ Login did not return valid token"
fi
echo "User token: $TOKEN"
echo

echo "=== 4. Check email availability ==="
EMAIL_TAKEN=$(curl -s -X GET $API/authentication/checkEmail/john@example.com)
EMAIL_FREE=$(curl -s -X GET $API/authentication/checkEmail/other@example.com)
echo $EMAIL_TAKEN | jq .
echo $EMAIL_FREE | jq .
if [[ $(echo $EMAIL_TAKEN | jq -r .success) == "false" ]]; then
  echo "✅ Existing email reported as taken"
else
  echo "❌ Existing email not reported as taken"
fi
if [[ $(echo $EMAIL_FREE | jq -r .success) == "true" ]]; then
  echo "✅ New email reported as available"
else
  echo "❌ New email not reported as available"
fi
echo

echo "=== 5. Check username availability ==="
USER_TAKEN=$(curl -s -X GET $API/authentication/checkUsername/john)
USER_FREE=$(curl -s -X GET $API/authentication/checkUsername/otheruser)
echo $USER_TAKEN | jq .
echo $USER_FREE | jq .
if [[ $(echo $USER_TAKEN | jq -r .success) == "false" ]]; then
  echo "✅ Existing username reported as taken"
else
  echo "❌ Existing username not reported as taken"
fi
if [[ $(echo $USER_FREE | jq -r .success) == "true" ]]; then
  echo "✅ New username reported as available"
else
  echo "❌ New username not reported as available"
fi
echo

echo "=== 6. Get profile (requires token) ==="
PROFILE_RESPONSE=$(curl -s -X GET $API/authentication/profile \
  -H "Authorization: Bearer $TOKEN")
echo $PROFILE_RESPONSE | jq .
if [[ $(echo $PROFILE_RESPONSE | jq -r .success) == "true" ]]; then
  echo "✅ Private profile accessible with token"
else
  echo "❌ Private profile not accessible"
fi
echo

echo "=== 7. Get public profile (by username) ==="
PUBLIC_RESPONSE=$(curl -s -X GET $API/authentication/publicProfile/john)
echo $PUBLIC_RESPONSE | jq .
if [[ $(echo $PUBLIC_RESPONSE | jq -r .success) == "true" ]]; then
  echo "✅ Public profile accessible by username"
else
  echo "❌ Public profile not accessible"
fi
echo
