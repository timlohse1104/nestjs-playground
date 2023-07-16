<script lang="ts">
	import {io} from 'socket.io-client';
    import { onMount, afterUpdate  } from 'svelte';
    import { __values } from 'tslib';
    const socket = io('http://localhost:3000');

    let messages = [];
    let joined = false;
    let username = '';
    let newMessage = '';
    let chatSection;
    let typingDisplay = '';

    // Svelte lifecycle hooks
    onMount(() => {
        // Establish websocket connection
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

        // Subscribe to new messages
        socket.on('message', message => {
            messages = [...messages, {
                ...message,
                timestamp: new Date(message.timestamp).toLocaleString()
            }];
        })
        
        // Subscribe to typing events
        socket.on('typing', ({name, isTyping}) => {
            if (isTyping) {
                typingDisplay = `${name} schreibt...`;
            } else {
                typingDisplay = '';
            }
        })
    }) 

    afterUpdate(() => {
        // Auto scroll to bottom for latest messages
        if (chatSection) chatSection.scrollTop = chatSection?.scrollHeight;
    });

    // Custom functions

    const join = () => {
        // Join chat room
        socket.emit('join', {
            name: username
        }, (allNames) => {
            console.log('Identified names for this client: ', allNames);
            joined = true;
        });
    }

    let typingTimeout
    const emitTyping = () => {
        // Broadcast typing status to other users
        socket.emit('typing', {
            isTyping: true
        });
        // Automatically reset typing status after 2 seconds
        typingTimeout = setTimeout(() => {
            socket.emit('typing', {
                isTyping: false
            });
        }, 2000);
    }

    const sendMessage = () => {
        // Send message to server
        socket.emit('createMessage', {
            name: username,
            text: newMessage
        }, (createdMessage) => {
            console.log('Created message: ', createdMessage);
            newMessage = '';
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

    {#if !joined}
        <section class="hero-body">
            <div class="container">
                <div class="field has-addons">
                    <div class="control is-expanded">
                        <input bind:value={username} class="input" type="text" placeholder="Dein Name" />
                    </div>
                    <div class="control">
                        <button class="button is-info" on:click={join}>
                            Beitreten
                        </button>
                    </div>
                </div>
            </div>
        </section>
    {:else}
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

                {#if typingDisplay}
                    <p class="is-size-7">{typingDisplay}</p>
                {/if}
                <form on:submit|preventDefault={sendMessage}>
                    <div class="field has-addons">
                        <div class="control is-expanded">
                            <input on:input={emitTyping} bind:value={newMessage} class="input" name="userInput" type="text" placeholder="Schreibe deine Nachricht" />
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
    {/if}
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
