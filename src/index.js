/* Do NOT add any more modules */
var http = require('http');
var url = require('url');

// TODO: Add more test data to work with
// test data must be an array of 'Pet' objects
var pets = [
  {
    "id": 0,
    "name": "doggie",
    "photoUrls": [
      "http://google.com/"
    ],
    "tags": [
      "tag1"
    ],
    "status": "available"
  },
  {
    "id": 1,
    "name": "hamster",
    "photoUrls": [
      "http://bing.com/"
    ],
    "tags": [
      "tag2"
    ],
    "status": "sold"
  },
  {
    "id": 2,
    "name": "fish",
    "photoUrls": [
      "http://apple.com/"
    ],
    "tags": ["tag1", "tag3"],
    "status": "available"
  },
  {
    "id": 3,
    "name": "catapalooza",
    "photoUrls": [
      "https://www.yahoo.com/"
    ],
    "tags": ["tag2", "tag3"],
    "status": "sold"
  }
];

async function findId(id) {
	return new Promise((resolve, reject) => {
		const pet = pets.find((pet) => pet.id === parseInt(id));
		if (pet) {
      resolve(pet);
    } else {
      reject('Pet not found');
    }
	});
};

async function createPet(pet) {
  return new Promise((resolve, _) => {
    const newPet = {
      id: pets.length,
      ...pet,
    };
    pets.push(newPet);
    resolve(newPet);
  });
}

async function updatePet(info) {
  return new Promise((resolve, reject) => {
    const pet = pets.find((pet) => pet.id === info['id']);
    if (!pet) {
      reject('Pet not found');
    }
    pet.name = info['name'];
    pet.photoUrls = info['photoUrls'];
    pet.tags = info['tags'];
    pet.status = info['status'];
    resolve(pet);
  });
}

function filterStatus(pet, statuses) {
  for (const s of statuses) {
    if (pet.status === s) {
      return true;
    }
  }
  return false;
}

async function findStatus(statuses) {
  const statusPets = pets.filter((pet) => filterStatus(pet, statuses));
  return([...statusPets]);
}

function checkValidStatus(statuses) {
  for (const s of statuses) {
    if (s !== 'available' && s !== 'pending' && s !== 'sold') {
      return false;
    }
  }
  return true;
}

function filterTags(pet, selectedTags) {
  for (const s of selectedTags) {
    if (pet.tags.includes(s)) {
      return true;
    }
  }
  return false;
}

async function findTags(tagsInfo) {
  const selectedTags = tagsInfo[0].split(',');
  const petWTags = pets.filter((pet) => filterTags(pet, selectedTags));
  return([...petWTags]);
}

async function deletePet(id) {
  return new Promise((resolve, reject) => {
    const pet = pets.find((pet) => pet.id === parseInt(id));
		if (!pet) {
      reject('Pet not found');
    }
    const remainingPets = pets.filter((pet) => pet.id !== parseInt(id));
    pets = [...remainingPets];
    resolve('Pet deleted successfully');
  });
}

function getData(req) {
  return new Promise((resolve, reject) => {
      try {
          let requestBody = "";
          req.on("data", (section) => {
              requestBody += section.toString();
          });
          req.on("end", () => {
              resolve(requestBody);
          });
      } catch (error) {
          reject(error);
      }
  });
}

http.createServer(async function (req, res) {
    // TODO: Implement routes from API Spec
    if (req.url === '/pet' && req.method === "POST") {
      try {
        const pet_info = await getData(req);
        const pet = await createPet(JSON.parse(pet_info));
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(pet));
      } catch (error) {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end("Invalid Input");
      }
    } else if (req.url === '/pet' && req.method === "PUT") {
      try {
        const pet_info = JSON.parse(await getData(req));
        if (Number.isInteger(pet_info['id'])) {
          try {
            const pet = await updatePet(pet_info);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(pet));
          } catch {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end("Pet not found");
          }
        } else {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end("Invalid ID supplied");
        }
      } catch (error) {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end("Validation exception");
      }
    } else if (req.url.match(/\/pet\/findByStatus\?status([^]*)/) && req.method === 'GET') {
      const statuses = Object.values(url.parse(req.url, true).query)[0].split(',');
      if (checkValidStatus(statuses)) {
        const curr = await findStatus(statuses);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(curr));
      } else {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end("Invalid status value");
      }
    } else if (req.url.match(/\/pet\/findByTags\?tags([^]*)/) && req.method === 'GET') {
      const curr = await findTags(Object.values(url.parse(req.url, true).query));
      if (JSON.stringify(curr) === '[]') {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end("Invalid tag value");
      } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(curr));
      }
    } else if (req.url.match(/\/pet\/([0-9]+)/) && req.method === 'GET') {
      try {
        const id = req.url.split('/')[2];
        const curr = await findId(id);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(curr));
      } catch (error) {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end('Pet not found');
      }
    } else if (req.url.match(/\/pet\/([^]*)/) && req.method === 'GET') {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end('Invalid ID supplied');
    } else if (req.url.match(/\/pet\/([0-9]+)/) && req.method === 'DELETE') {
      try {
        const id = req.url.split('/')[2];
        const curr = await deletePet(id);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(curr));
      } catch (error) {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end('Pet not found');
      }
    } else if (req.url.match(/\/pet\/([^]*)/) && req.method === 'DELETE') {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end('Invalid pet ID value');
    } else {
      /* Catch-All */
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.write("Not Found");
      res.end();
    }
}).listen(8000);
console.log('Server running at http://localhost:8000');
