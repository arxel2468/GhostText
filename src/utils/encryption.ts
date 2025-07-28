
export async function generateKeyFromPassword(password: string): Promise<CryptoKey> {
    // Convert the password string to a Uint8Array
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Use SHA-256 to create a hash of the password
    const passwordHash = await crypto.subtle.digest('SHA-256', passwordData);
    
    // Import the hash as a CryptoKey
    return crypto.subtle.importKey(
      'raw',
      passwordHash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  export async function encryptMessage(message: string, password: string): Promise<string> {
    try {
      // Generate a key from the password
      const key = await generateKeyFromPassword(password);
      
      // Create an initialization vector (IV)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encode the message
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      // Encrypt the data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        data
      );
      
      // Combine the IV and encrypted data
      const result = new Uint8Array(iv.length + encryptedData.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encryptedData), iv.length);
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }
  
  export async function decryptMessage(encryptedMessage: string, password: string): Promise<string> {
    try {
      // Convert from base64
      const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
      
      // Extract the IV (first 12 bytes)
      const iv = encryptedData.slice(0, 12);
      const data = encryptedData.slice(12);
      
      // Generate a key from the password
      const key = await generateKeyFromPassword(password);
      
      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        data
      );
      
      // Decode the result
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }