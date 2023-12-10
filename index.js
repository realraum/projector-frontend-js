import net from 'net';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

const client = new net.Socket();
let connected = false;

client.on('connect', () => {
    console.log(`client.on('connect')`);
    connected = true;
});

client.on('close', () => {
    console.log(`client.on('close')`);
    connected = false;
});

client.on('error', (err) => {
    console.log(`client.on('error')`, err);
    connected = false;
});

client.on('data', (data) => {
    console.log(`client.on('data')`, data);
});

dotenv.config({path: 'config.env'});

const basePayload = [0x05, 0x00, 0x06, 0x00, 0x00, 0x03, 0x00];

const commandsMap = Object.entries({
    // input
    inputHdmi: [0xcd, 0x13],
    inputPc: [0xd0, 0x13],
    inputComponent1: [0xd1, 0x13],
    inputComponent2: [0xd2, 0x13],
    inputSVideo: [0xcf, 0x13],
    inputVideo: [0xce, 0x13],

    // volume
    volumeUp: [0xfa, 0x13],
    volumeDown: [0xfb, 0x13],
    volumeMute: [0xfc, 0x13],
    volumeUnmute: [0xfd, 0x13],

    // power
    powerOn: [0x04, 0x00],
    powerOff: [0x05, 0x00],

    // menu
    menuToggle: [0x1d, 0x14],
    menuUp: [0x1e, 0x14],
    menuDown: [0x1f, 0x14],
    menuLeft: [0x20, 0x14],
    menuRight: [0x21, 0x14],
    menuOk: [0x23, 0x14],

    // picture
    pictureMute: [0xee, 0x13],
    pictureUnmute: [0xef, 0x13],
    pictureFreeze: [0xf0, 0x13],
    pictureUnfreeze: [0xf1, 0x13],
    pictureContrastUp: [0xf6, 0x13],
    pictureContrastDown: [0xf7, 0x13],
    pictureBrightnessUp: [0xf5, 0x13],
    pictureBrightnessDown: [0xf4, 0x13],
}).map(([key, value]) => {
    let bla = [];
    console.log({ key });
    bla = bla.concat(basePayload, value);

    return [key, bla];
});

const commands = Object.fromEntries(commandsMap);

console.log({ commands });

const connectIfNotConnected = async () => {
    if (!client.connecting && !connected) {
        console.log('Connecting...');
        client.connect({
            host: BEAMER_ADDRESS,
            port: BEAMER_PORT,
            keepAlive: true,
        });
    } else {
        console.log('Already connected');
    }

    // wait until connected or timeout with 3 seconds
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Connection timeout');
        }, 3000);

        const interval = setInterval(() => {
            if (connected) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });

    await promise;
};

const sendCommand = async (command) => {
    await connectIfNotConnected();

    if (!client.writable) {
        console.error('Client not writable');
        return { success: false, error: 'Client not writable' };
    }

    if (!commands[command]) {
        console.error('Unknown command', command);
        return { success: false, error: 'Unknown command' };
    }

    const buffer = Buffer.from(commands[command]);
    client.write(buffer);

    if (DEBUG === 'true') {
        console.log('Sent command', command, buffer, 'to', BEAMER_ADDRESS + ':' + BEAMER_PORT);
    }

    return { success: true, command };
};

const {
    SERVER_PORT = '3000',
    SERVER_HOST = '0.0.0.0',
    DEBUG = 'false',
    BEAMER_ADDRESS = '192.168.33.41',
    BEAMER_PORT = '41794',
} = process.env;

const app = express();

app.use(express.static('public'));

const api = express.Router();

api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());

api.get('/command', async (req, res) => {
    console.log('command', req.query, req.body);

    const data = req.query || req.body;

    if (data.command) {
        // check if command is valid
        const { success, error } = await sendCommand(data.command);
        if (!success) {
            res.redirect('/?error=' + encodeURIComponent(error));
            return;
        }
    }

    res.redirect('/');
});

app.use('/api', api);

app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`Server running at http://${SERVER_HOST}:${SERVER_PORT}/`);
});
