<script lang="ts">
	import {io} from 'socket.io-client';
    import { onMount, afterUpdate  } from 'svelte';
    import { __values } from 'tslib';
    const socket = io('http://localhost:3000');

    let messages = [];
    const username = 'Tim';
    let newMessage = '';
    let chatSection;

    // Svelte lifecycle hooks
    onMount(() => {
        socket.on('connect', () => {
            console.log(`Established websocket connection to ${socket.io.opts.hostname}:${socket.io.opts.port}.`);
            socket.emit('findAllMessages', {}, (response) => {
                const uniqueUsers = [...new Set(response.map(message => message.name))];
                console.log(`Received ${response?.length} initial messages with ${uniqueUsers?.length} unique users from server.`);
                messages = [...response.map(message => {
                    return {
                        ...message,
                        timestamp: new Date(message.timestamp).toLocaleString()
                    }
                })];
            });
        });
    }) 

    afterUpdate(() => {
        // Auto scroll to bottom for latest messages
        chatSection.scrollTop = chatSection.scrollHeight;
    });

    // Custom functions
    const sendMessage = () => {
        socket.emit('createMessage', {
            name: username,
            text: newMessage
        }, (response) => {
            console.log(response);
            messages = [...messages, {
                ...response,
                timestamp: new Date(response.timestamp).toLocaleString()
            }];
        });
    }
</script>

<main class="main-container">
    <section class="hero is-link is-bold hero-head">
        <div class="hero-body">
            <div class="container">
                <p class="title">
                    Köster Chat
                </p>
                <p class="subtitle">
                    Powerd by Svelte and Websockets
                </p>
            </div>
        </div>
    </section>

    <section class="chat-section" bind:this={chatSection}>
        {#each messages as message}
            <div class="message-container">
                <article class="message {message?.name === username? 'is-info': 'is-success' } {message?.name === username ? 'message-left' : 'message-right'}">
                    <div class="message-header">
                        <p>{message?.name} | {message?.timestamp}</p>
                    </div>
                    <div class="message-body">
                        {message?.text}
                    </div>
                </article>
            </div>
        {/each}
    </section>

    <section class="hero-foot">
        <footer class="section is-small">
            <form on:submit|preventDefault={(e) => {
                    sendMessage();
                    newMessage = '';
                }}>
                <div class="field has-addons">
                    <div class="control is-expanded">
                        <input bind:value={newMessage} class="input" name="userInput" type="text" placeholder="Schreibe deine Nachricht" />
                    </div>
                    <div class="control">
                        <button class="button is-info">
                            Senden
                        </button>
                    </div>
                </div>
            </form>
        </footer>
    </section>
</main>

<style>
    :global(html, body) {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    .main-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .hero-head {
        flex: 0 0 auto;
    }

    .hero-foot {
        flex: 0 0 auto;
    }

    .chat-section {
        overflow-y: auto;
        flex: 1 1 auto;
        padding: 1em;
    }

    .message-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 1em;
    }

    .message-left {
        align-self: flex-start;
    }

    .message-right {
        align-self: flex-end;
    }
</style>
