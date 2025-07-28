// src/utils/roomSecurity.ts
async function sha256(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  export async function generateRoomId(fileName: string, accessPhrase: string): Promise<string> {
    // Combine the file name and access phrase
    const combined = `${fileName}|||${accessPhrase}`;
    
    // Create a SHA-256 hash
    const hash = await sha256(combined);
    
    // Return the hash as the room ID
    return hash;
  }