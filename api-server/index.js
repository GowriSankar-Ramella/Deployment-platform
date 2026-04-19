const express = require('express')
const { generateSlug } = require('random-word-slugs')
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs')
const { Server } = require('socket.io')
// const Redis = require('ioredis')
const { createClient } = require('redis')
const cors = require('cors')


const app = express()

app.use(cors({
    origin: 'http://localhost:3000', // React dev server
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const PORT = 9000

const subscriber = createClient({
    username: 'default',
    password: 'QjACcYXAcriCTfDkjudBAb2fx2t4BqZd',
    socket: {
        host: 'redis-19741.c301.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 19741
    }
})

subscriber.on('error', err => {
    console.error('Redis Subscriber Error', err)
})


const io = new Server({ cors: '*' })

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', `Joined ${channel}`)
    })
})

io.listen(9002, () => console.log('Socket Server 9002'))

const ecsClient = new ECSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIA3RIUWWBNKUYZOEFN',
        secretAccessKey: '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'
    }
})

const config = {
    CLUSTER: 'arn:aws:ecs:ap-south-1:793001767002:cluster/builder-cluster-newone',
    TASK: 'arn:aws:ecs:ap-south-1:793001767002:task-definition/builder-task-newone'
}

app.use(express.json())

app.post('/project', async (req, res) => {
    const { gitURL, slug } = req.body
    const projectSlug = slug ? slug : generateSlug()

    // Spin the container
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['subnet-012a442ac8d487095', 'subnet-0f41c7bda9dea246f', 'subnet-004b186e150627af2'],
                securityGroups: ['sg-0cf9f2fc334978d5c']
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image-newone',
                    environment: [
                        { name: 'GIT_REPOSITORY__URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        }
    })

    await ecsClient.send(command);

    return res.json({ status: 'queued', data: { projectSlug, url: `http://${projectSlug}.localhost:8000` } })

})

// async function initRedisSubscribe() {
//     console.log('Subscribed to logs....')
//     subscriber.psubscribe('logs:*')
//     subscriber.on('pmessage', (pattern, channel, message) => {
//         io.to(channel).emit('message', message)
//     })
// }
async function initRedisSubscribe() {
    await subscriber.connect()
    console.log('Subscribed to logs....')

    await subscriber.pSubscribe('logs:*', (message, channel) => {
        io.to(channel).emit('message', message)
    })
}


initRedisSubscribe()

app.listen(PORT, () => console.log(`API Server Running..${PORT}`))