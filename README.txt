You need to install the dependencies on both the front and back end

// In the root folder run
npm install

// In the angular-src folder run
npm install

// Run the server from root
npm start

// Run the client from angular-src
ng serve

// Visit localhost:4200 to see angular app


//Reset
//docker compose down -v
//docker compose up --build
//docker-compose -f docker-compose.dev.yml up --build

docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build

docker logs -f rezerwacja_api_dev
docker logs -f rezerwacja_db_dev

docker-compose -f docker-compose.dev.yml down -v --remove-orphans; docker system prune -af --volumes;  docker-compose -f docker-compose.dev.yml build --no-cache; docker-compose -f docker-compose.dev.yml up

./test_flowNEW4.sh 
./test_user_endpointsNEW2.sh
curl http://localhost:3000/health   