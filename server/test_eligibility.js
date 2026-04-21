async function test() {
  const payloads = [16, 17, 18].map(age => ({
    age, state: "Tamil Nadu", registrationStatus: "not_registered", scenario: "first_time", hasAddressProof: false, movedRecently: false, migrationType: "unspecified", intent: "" 
  }));

  for (const p of payloads) {
    const res = await fetch('http://localhost:4000/api/eligibility', {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p)
    });
    const data = await res.json();
    console.log(`Age ${p.age}: ${data.userStatus[1] || data.userStatus[data.userStatus.length-1]} | Required Actions: ${data.requiredActions.join(' ; ')}`);
  }
}
test();
