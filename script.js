document.addEventListener("DOMContentLoaded", () => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXguaq9HM2DHXjb5SG5ceFAzR5vVZPHrMdpk199RR7e8XAYOt9c9MTUBgoB0brL_U/exec';
  
  console.log("Sedang memuat data voucher...");
  const usedCodesPromise = fetch(`${SCRIPT_URL}?type=check`)
    .then(async res => {
        if (!res.ok) throw new Error("Gagal load data");
        const data = await res.json();
        console.log("✅ Data voucher siap!");
        return data;
    })
    .catch(err => {
        console.warn("⚠️ Prefetch gagal (akan coba lagi saat klik):", err);
        return null;
    });

  const nameInput = document.getElementById("userName");
  const phoneInput = document.getElementById("userPhone");
  const codeInput = document.getElementById("voucherCode");
  const btn = document.getElementById("checkBtn");
  
  
  
  btn.addEventListener("click", submitVoucher);
  
 
  codeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitVoucher();
  });

  async function submitVoucher() {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();

    if (!name || !phone || !code) {
      alert("Mohon isi semua data (Nama, No HP, dan Kode)!");
      return;
    }

    btn.disabled = true;
    btn.textContent = "MEMERIKSA...";

    try {

        const hash = await sha256(code);


        if (typeof VOUCHER_DB === 'undefined') {
            alert("Error: Database voucher tidak termuat.");
            btn.disabled = false;
            btn.textContent = "KLAIM VOUCHER";
            return;
        }

        const validVoucher = VOUCHER_DB.find(v => v.h === hash);

        if (validVoucher) {

            try {
                let usedCodes = await usedCodesPromise;

                if (!usedCodes) {
                    const checkResponse = await fetch(`${SCRIPT_URL}?type=check`);
                    usedCodes = await checkResponse.json();
                }
                
                if (usedCodes && usedCodes.includes(code)) {
                    showModal("Sudah Terpakai", "❌ Kode voucher ini SUDAH PERNAH digunakan", "⚠️");
                    btn.disabled = false;
                    btn.textContent = "KLAIM VOUCHER";
                    return;
                }
            } catch (e) {
                console.warn("Gagal cek duplikat (mungkin baru pertama kali):", e);
            }


            const decryptedPrize = await decryptPrize(validVoucher.p, code);

            const params = new URLSearchParams();
            params.append('nama', name);
            params.append('phone', phone);
            params.append('kode', code);
            params.append('hadiah', decryptedPrize);
            params.append('refId', validVoucher.h.substring(0, 12).toUpperCase());

            await fetch(SCRIPT_URL, {
                method: 'POST',
                body: params,
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


            sessionStorage.setItem('voucherResult', JSON.stringify({
                name: name,
                prize: decryptedPrize,
                refId: validVoucher.h.substring(0, 12).toUpperCase(),
                date: new Date().toLocaleString('id-ID')
            }));

            window.location.href = `success.html`;

        } else {

            showModal("Kode Salah", "❌ Kode voucher tidak valid.", "⚠️");
            btn.disabled = false;
            btn.textContent = "KLAIM VOUCHER";
        }

    } catch (err) {
      console.error("Error:", err);
      showModal("Gagal Koneksi", "Gagal koneksi ke server database. Coba lagi.", "📡");
      btn.disabled = false;
      btn.textContent = "KLAIM VOUCHER";
    }
  }


  const modal = document.getElementById("customModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalIcon = document.getElementById("modalIcon");
  const modalBtn = document.getElementById("modalBtn");

  modalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  function showModal(title, msg, icon = "⚠️") {
    modalTitle.textContent = title;
    modalMessage.textContent = msg;
    modalIcon.textContent = icon;
    modal.classList.remove("hidden");
  }


  const _0x = ['R', 'A', 'P', 'V', 'O', 'U', 'C', 'H', 'E', '2', '0', '6', '_', 'M', 'N', 'T'];
  const SALT = _0x[3]+_0x[4]+_0x[5]+_0x[6]+_0x[7]+_0x[8]+_0x[0]+_0x[9]+_0x[10]+_0x[9]+_0x[11]+_0x[12]+_0x[13]+_0x[1]+_0x[14]+_0x[15]+_0x[1]+_0x[2];

    async function sha256(message, useSalt = true) {
    let msgToHash = message;
    if (useSalt) {
        msgToHash += SALT;
    }
    const msgBuffer = new TextEncoder().encode(msgToHash);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    
    if (useSalt) {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    } 
    
    return new Uint8Array(hashBuffer);
  }

  async function decryptPrize(encryptedBase64, code) {
    try {
        const binaryString = atob(encryptedBase64);
        const len = binaryString.length;
        const encryptedBytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            encryptedBytes[i] = binaryString.charCodeAt(i);
        }

        const keyBytes = await sha256(code, false);

        const decryptedBytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
        }

        return new TextDecoder().decode(decryptedBytes);
    } catch (e) {
        console.error("Gagal decrypt prize:", e);
        return "Gagal memuat hadiah (Decryption Error)";
    }
  }
});
