import { MongoClient } from 'mongodb';
import { AppContext } from '../types/index';
import dotenv from 'dotenv';
dotenv.config();

const doorfront_uri = process.env.DOORFRONT_URI;
const dbName = 'myFirstDatabase';
const collectionName = 'collect_panorama';
let client: MongoClient;

async function connectToDoorfrontDB() {
  try {
    if(!client){
        client = new MongoClient(doorfront_uri!, {
        maxPoolSize: 10,
        });
        await client.connect();
        console.log('Connected to Doorfront database');
    }
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to Doorfront database:', error);
  }
}

export async function getPanoramaData(ctx: AppContext, address: string) {
    const { res } = ctx;
  try {
    const db = await connectToDoorfrontDB();
    if (db && address.trim() !== '') {
        const collection = db.collection(collectionName);
        const data = await collection.findOne(
            { address:{$regex: address, $options: 'i' }}, 
            { projection: {url:1, human_labels:{$slice:1}, creator:1,address:1, location: 1 }})
        if (data) {
            console.log("Panorama data fetched successfully for address:", address);
            // res.status(200).json(data);
            return data; 
        }
        else return null;
        // res.status(404).json({ message: 'No panorama data found for this address.' });
    } else {
        // res.status(500).json({ message: 'Database connection failed or invalid address.' });
        console.error('Database connection failed or invalid address');
        return null;
    }
  } catch (error) {
    console.error('Error fetching panorama data:', error);
    return null;
  }
}