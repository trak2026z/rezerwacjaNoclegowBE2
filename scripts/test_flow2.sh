#!/bin/zsh
set -e

API="http://localhost:3000"

echo "=== 1. Register users ==="
REG_JOHN=$(curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","username":"john","password":"Haslo123!"}')
echo $REG_JOHN | jq .
if [[ $(echo $REG_JOHN | jq -r .success) == "true" ]]; then
  echo "✅ John registered"
else
  echo "❌ John register failed"
fi
echo

REG_ANK=$(curl -s -X POST $API/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ank@example.com","username":"ank","password":"Haslo123!"}')
echo $REG_ANK | jq .
if [[ $(echo $REG_ANK | jq -r .success) == "true" ]]; then
  echo "✅ Ank registered"
else
  echo "❌ Ank register failed"
fi
echo

echo "=== 2. Login users ==="
LOGIN_JOHN=$(curl -s -X POST $API/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"Haslo123!"}')
echo $LOGIN_JOHN | jq .
JOHN_TOKEN=$(echo $LOGIN_JOHN | jq -r .data.token)
if [[ -n "$JOHN_TOKEN" && "$JOHN_TOKEN" != "null" ]]; then
  echo "✅ John login returned token"
else
  echo "❌ John login failed"
fi
echo "John token: $JOHN_TOKEN"
echo

LOGIN_ANK=$(curl -s -X POST $API/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ank","password":"Haslo123!"}')
echo $LOGIN_ANK | jq .
ANK_TOKEN=$(echo $LOGIN_ANK | jq -r .data.token)
if [[ -n "$ANK_TOKEN" && "$ANK_TOKEN" != "null" ]]; then
  echo "✅ Ank login returned token"
else
  echo "❌ Ank login failed"
fi
echo "Ank token: $ANK_TOKEN"
echo

echo "=== 3. John creates a room ==="
ROOM1=$(curl -s -X POST $API/rooms \
  -H "Authorization: Bearer $JOHN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Johna","body":"Pokój z widokiem","startAt":"2025-10-01T12:00:00Z","endsAt":"2025-10-07T12:00:00Z","city":"Gdańsk"}')
echo $ROOM1 | jq .
ROOM_ID_JOHN=$(echo $ROOM1 | jq -r .room._id)
if [[ $(echo $ROOM1 | jq -r .success) == "true" ]]; then
  echo "✅ John created room"
else
  echo "❌ John room creation failed"
fi
echo "Room John ID: $ROOM_ID_JOHN"
echo

echo "=== 4. Ank creates a room ==="
ROOM2=$(curl -s -X POST $API/rooms \
  -H "Authorization: Bearer $ANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Anki","body":"Pokój z balkonem","startAt":"2025-11-01T12:00:00Z","endsAt":"2025-11-07T12:00:00Z","city":"Kraków"}')
echo $ROOM2 | jq .
ROOM_ID_ANK=$(echo $ROOM2 | jq -r .room._id)
if [[ $(echo $ROOM2 | jq -r .success) == "true" ]]; then
  echo "✅ Ank created room"
else
  echo "❌ Ank room creation failed"
fi
echo "Room Ank ID: $ROOM_ID_ANK"
echo

echo "=== 5. John updates his room ==="
UPDATE=$(curl -s -X PUT $API/rooms/$ROOM_ID_JOHN \
  -H "Authorization: Bearer $JOHN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokoj Johna updated","body":"Nowy opis","city":"Sopot"}')
echo $UPDATE | jq .
if [[ $(echo $UPDATE | jq -r .success) == "true" ]]; then
  echo "✅ John updated his room"
else
  echo "❌ John update failed"
fi
echo

echo "=== 6. Ank tries to update John's room (should fail) ==="
UPDATE_FAIL=$(curl -s -X PUT $API/rooms/$ROOM_ID_JOHN \
  -H "Authorization: Bearer $ANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hack attempt"}')
echo $UPDATE_FAIL | jq .
if [[ $(echo $UPDATE_FAIL | jq -r .success) == "false" ]]; then
  echo "✅ Ank update rejected"
else
  echo "❌ Ank was able to update John's room"
fi
echo

echo "=== 7. Likes & dislikes (edge cases) ==="
LIKE1=$(curl -s -X POST $API/rooms/$ROOM_ID_JOHN/like \
  -H "Authorization: Bearer $ANK_TOKEN")
echo $LIKE1 | jq .
if [[ $(echo $LIKE1 | jq -r .success) == "true" ]]; then
  echo "✅ Ank liked John's room"
else
  echo "❌ Like failed"
fi
echo

LIKE2=$(curl -s -X POST $API/rooms/$ROOM_ID_JOHN/like \
  -H "Authorization: Bearer $ANK_TOKEN")
echo $LIKE2 | jq .
if [[ $(echo $LIKE2 | jq -r .success) == "false" ]]; then
  echo "✅ Second like rejected"
else
  echo "❌ Second like accepted!"
fi
echo

DISLIKE1=$(curl -s -X POST $API/rooms/$ROOM_ID_JOHN/dislike \
  -H "Authorization: Bearer $ANK_TOKEN")
echo $DISLIKE1 | jq .
if [[ $(echo $DISLIKE1 | jq -r .success) == "true" ]]; then
  echo "✅ Ank disliked John's room"
else
  echo "❌ Dislike failed"
fi
echo

DISLIKE2=$(curl -s -X POST $API/rooms/$ROOM_ID_JOHN/dislike \
  -H "Authorization: Bearer $ANK_TOKEN")
echo $DISLIKE2 | jq .
if [[ $(echo $DISLIKE2 | jq -r .success) == "false" ]]; then
  echo "✅ Second dislike rejected"
else
  echo "❌ Second dislike accepted!"
fi
echo

echo "=== 8. Reservations ==="
RESERVE1=$(curl -s -X POST $API/rooms/$ROOM_ID_ANK/reserve \
  -H "Authorization: Bearer $JOHN_TOKEN")
echo $RESERVE1 | jq .
if [[ $(echo $RESERVE1 | jq -r .success) == "true" ]]; then
  echo "✅ John reserved Ank's room"
else
  echo "❌ Reservation failed"
fi
echo

RESERVE2=$(curl -s -X POST $API/rooms/$ROOM_ID_ANK/reserve \
  -H "Authorization: Bearer $JOHN_TOKEN")
echo $RESERVE2 | jq .
if [[ $(echo $RESERVE2 | jq -r .success) == "false" ]]; then
  echo "✅ Double reservation rejected"
else
  echo "❌ Double reservation accepted!"
fi
echo

SELF_RESERVE=$(curl -s -X POST $API/rooms/$ROOM_ID_JOHN/reserve \
  -H "Authorization: Bearer $JOHN_TOKEN")
echo $SELF_RESERVE | jq .
if [[ $(echo $SELF_RESERVE | jq -r .success) == "false" ]]; then
  echo "✅ Self-reservation rejected"
else
  echo "❌ John was able to reserve his own room!"
fi
echo

ANK_RESERVE=$(curl -s -X POST $API/rooms/$ROOM_ID_JOHN/reserve \
  -H "Authorization: Bearer $ANK_TOKEN")
echo $ANK_RESERVE | jq .
if [[ $(echo $ANK_RESERVE | jq -r .success) == "false" ]]; then
  echo "✅ Ank reservation rejected"
else
  echo "❌ Ank reserved John's room!"
fi
echo

echo "=== 9. Verify rooms ==="
GET_JOHN=$(curl -s -X GET $API/rooms/$ROOM_ID_JOHN \
  -H "Authorization: Bearer $JOHN_TOKEN")
echo $GET_JOHN | jq .
if [[ $(echo $GET_JOHN | jq -r .success) == "true" ]]; then
  echo "✅ John's room fetched"
else
  echo "❌ John's room fetch failed"
fi
echo

GET_ANK=$(curl -s -X GET $API/rooms/$ROOM_ID_ANK \
  -H "Authorization: Bearer $ANK_TOKEN")
echo $GET_ANK | jq .
if [[ $(echo $GET_ANK | jq -r .success) == "true" ]]; then
  echo "✅ Ank's room fetched"
else
  echo "❌ Ank's room fetch failed"
fi
echo

echo "=== 10. John deletes his room ==="
DELETE_OK=$(curl -s -X DELETE $API/rooms/$ROOM_ID_JOHN \
  -H "Authorization: Bearer $JOHN_TOKEN")
echo $DELETE_OK | jq .
if [[ $(echo $DELETE_OK | jq -r .success) == "true" ]]; then
  echo "✅ John deleted his room"
else
  echo "❌ Delete failed"
fi
echo

echo "=== 11. Ank tries to delete John's room (should fail) ==="
DELETE_FAIL=$(curl -s -X DELETE $API/rooms/$ROOM_ID_JOHN \
  -H "Authorization: Bearer $ANK_TOKEN")
echo $DELETE_FAIL | jq .
if [[ $(echo $DELETE_FAIL | jq -r .success) == "false" ]]; then
  echo "✅ Ank delete rejected"
else
  echo "❌ Ank was able to delete John's room!"
fi
echo
