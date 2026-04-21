# Privacy Policy & Data Architecture

NagrikAI Pro is built on "Privacy-First" / "Stateless" mechanics avoiding compliance disasters natively.

## 1. No Persistent Storage
The system does not deploy a persistent database (e.g., PostgreSQL or MongoDB). No configurations in the backend write data to disk. 

## 2. No PII Collection
The system uses abstracted logic states. We do not prompt for, collect, nor require sensitive parameters like:
* Real Names
* Voter ID Numbers (EPIC)
* Aadhar Core IDs
* Exact Residential Street Addresses

## 3. Session-Level Memory
Data evaluating the user scenario is strictly transmitted as JSON via REST POST payloads. Once the Node execution finishes rendering the structural array backwards to the UI, the state variables are immediately garbage-collected locally. The frontend React map drops configurations aggressively upon browser refresh.

## 4. Analytical Tracking
There is zero hidden background tracking natively intercepting user behavior inside the React module. 
