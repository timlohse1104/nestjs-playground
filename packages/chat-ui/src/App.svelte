<script lang="ts">
  import { SocketAddress } from 'net';
	import {io} from 'socket.io-client';
    import { onMount } from 'svelte';
    const socket = io('http://localhost:3000');

    let messages = [];

    onMount(() => {
        socket.on('connect', () => {
            console.log(`Established websocket connection to ${socket.io.opts.hostname}:${socket.io.opts.port}`);
            socket.emit('findAllMessages', {}, (response) => {
                messages = [...response.map(message => {
                    return {
                        ...message,
                        timestamp: new Date(message.timestamp).toLocaleString()
                    }
                })];
                console.log(messages);
            });
        });
    }) 
</script>

<main>
	<div class="chat">
        {#each messages as message}
            <div class="message">
                <div class="message__timestamp">{message?.timestamp}</div>
                <div class="message__author">[{message?.name}]: {message?.text}</div>
            </div>
        {/each}
    </div>
</main>

<style>
	
</style>
