"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseClient";

const PASSCODE_COLLECTION = "pwd";
const PASSCODE_DOCUMENT_ID = "lily"; // As per your screenshot
const PASSCODE_FIELD_NAME = "pwd"; // As per your screenshot

/**
 * Verifies the entered passcode against the one stored in Firestore.
 * @param enteredPasscode The passcode entered by the user.
 * @returns True if the passcode is correct, false otherwise.
 */
export const verifyPasscode = async (
  enteredPasscode: string
): Promise<boolean> => {
  if (!db) {
    console.error(
      "Firestore is not initialized. Cannot verify passcode. Please check Firebase configuration."
    );
    return false;
  }

  try {
    const passcodeDocRef = doc(db, PASSCODE_COLLECTION, PASSCODE_DOCUMENT_ID);
    const docSnap = await getDoc(passcodeDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const storedPasscode = data?.[PASSCODE_FIELD_NAME];

      if (typeof storedPasscode === "string") {
        if (storedPasscode === enteredPasscode) {
          return true;
        } else {
          // Log detailed information for mismatch
          console.warn(
            `Passcode mismatch. Firestore Stored: '${storedPasscode}' (Type: ${typeof storedPasscode}, Length: ${
              storedPasscode.length
            }), Entered: '${enteredPasscode}' (Type: ${typeof enteredPasscode}, Length: ${
              enteredPasscode.length
            })`
          );
          return false;
        }
      } else {
        // Log if the stored value is not a string or is missing
        console.warn(
          `Stored passcode in Firestore ('${PASSCODE_COLLECTION}/${PASSCODE_DOCUMENT_ID}' field '${PASSCODE_FIELD_NAME}') is not a string or is missing. Actual Type: ${typeof storedPasscode}, Actual Value: `,
          storedPasscode
        );
        return false;
      }
    } else {
      console.error(
        `Passcode document '${PASSCODE_COLLECTION}/${PASSCODE_DOCUMENT_ID}' does not exist in Firestore. Check collection/document names and Firestore security rules.`
      );
      return false;
    }
  } catch (error) {
    console.error("Error verifying passcode with Firestore:", error);
    return false;
  }
};
