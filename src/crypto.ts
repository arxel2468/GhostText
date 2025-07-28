// Simple encryption/decryption using Web Crypto API
export async function encrypt(message: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive actual key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    derivedKey,
    data
  );
  
  // Combine salt, iv, and encrypted content
  const encryptedArray = new Uint8Array(encryptedContent);
  const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(encryptedArray, salt.length + iv.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...result));
}

export async function decrypt(encryptedMessage: string, key: string): Promise<string> {
  try {
    // Convert from base64
    const encryptedData = new Uint8Array(
      atob(encryptedMessage).split('').map(char => char.charCodeAt(0))
    );
    
    const encoder = new TextEncoder();
    
    // Extract salt, iv, and encrypted data
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 16 + 12);
    const data = encryptedData.slice(16 + 12);
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive actual key
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      derivedKey,
      data
    );
    
    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt message. Check your key.');
  }
}