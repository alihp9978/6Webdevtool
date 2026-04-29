Edge HTTP Forwarder

A minimal edge-executed request forwarder that streams incoming HTTP traffic to a backend server and returns the response in real time.

It’s designed to be simple, fast, and transparent — acting as a thin layer between clients and your origin.


---

Overview

This project provides a lightweight mechanism to forward HTTP requests through a globally distributed edge environment to a destination server defined via environment configuration.

It does not modify payloads or interpret protocols — it simply forwards requests and streams responses back.


---

Key Characteristics

Streaming-first design — request and response bodies flow without buffering

Low overhead — minimal logic, no dependencies

Stateless execution — no sessions, no persistence

Header filtering — removes problematic or non-forwardable headers

Transparent forwarding — preserves method, path, and body



---

How It Works

1. A client sends an HTTP request to the deployed endpoint


2. The edge handler receives and processes the request


3. Certain headers are filtered or adjusted


4. The request is forwarded to the configured backend


5. The backend response is streamed back to the client



The process is fully transparent and operates in real time.


---

Configuration

Define the destination server using an environment variable:

Variable	Example

TARGET_DOMAIN	https://example.com:443


Notes

Include the protocol (http:// or https://)

Ports can be specified if needed

Trailing slashes are handled automatically



---

Deployment

git clone <repository-url>
cd <project-folder>
deploy

After deployment, your endpoint will be publicly accessible.


---

Behavior Details

All request paths are forwarded unchanged

HTTP methods are preserved

Request bodies are streamed when applicable

Response bodies are streamed back immediately

Client IP may be forwarded via headers

Redirects are not automatically followed



---

Limitations

Works only with HTTP-based communication

No support for protocol upgrades (e.g. WebSocket)

No built-in retry or failover mechanisms

Execution time and bandwidth depend on your platform limits



---

Use Cases

Suitable for scenarios where you need:

A simple forwarding layer between client and server

Distributed entry points for HTTP traffic

Minimal infrastructure and maintenance


Not intended for:

Complex proxying or routing logic

High-availability systems requiring redundancy

Deep protocol handling beyond HTTP



---

Project Structure

.
├── api/index.js
├── package.json
├── config file
└── README.md


---

Responsibility

You are responsible for how this software is deployed and used, including compliance with any applicable rules, policies, or regulations.

No guarantees are provided regarding performance, availability, or suitability for any specific use case.


---

License

MIT
