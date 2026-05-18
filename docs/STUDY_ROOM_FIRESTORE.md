# Group study rooms — Firestore setup

Rooms live in collection **`studyRooms`**. Each room document ID is the **room code** (6 characters).

Messages: subcollection **`studyRooms/{roomId}/messages`**.

## What you must do (Firebase Console)

1. Open [Firebase Console](https://console.firebase.google.com) → your project → **Firestore Database** → **Rules**.
2. Prefer copying from repo root **`firestore.rules`** (includes `resources` + `studyRooms`). Merge with your console rules if needed, then **Publish**.

### Suggested rules (authenticated users only)

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /studyRooms/{roomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.keys().hasAll(['topic', 'createdBy', 'hostName', 'timer'])
        && request.resource.data.createdBy == request.auth.uid
        && roomId.matches('^[A-Z2-9]{6}$');
      allow update: if request.auth != null
        && request.auth.uid == resource.data.createdBy;

      match /messages/{msgId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null
          && request.resource.data.uid == request.auth.uid
          && request.resource.data.text is string
          && request.resource.data.text.size() > 0
          && request.resource.data.text.size() <= 800
          && request.resource.data.displayName is string
          && request.resource.data.displayName.size() <= 80;
      }
    }

  }
}
```

- **Host-only timer updates:** only `createdBy` can change the room doc (timer).  
- Adjust if you want any member to start the timer (weaker rule: `allow update: if request.auth != null` on `studyRooms` — not recommended).

3. **Publish** rules.

## Composite index (if Firebase asks)

If the chat query errors with a link to create an index, click that link. Usually:

- Collection: `studyRooms/{roomId}/messages`
- Fields: `createdAt` ascending

## Jitsi (voice)

Voice opens on **`/study/room/{CODE}/voice`** (embedded Jitsi on Btechverse). When the user leaves or ends the meet, they return to **`/study/room/{CODE}`** — not the Jitsi marketing page.

Room name on meet.jit.si: `BtechverseStudy{CODE}`. No extra Firebase config for Jitsi.
