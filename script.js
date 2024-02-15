let addNote = () => {
    let title = document.getElementById("add-note-title").value
    let content = document.getElementById("add-note-content").value
    const date = new Date()
    var currentDate = date.toLocaleString()
    let idb = indexedDB.open("notes-rcm",1)
    idb.onsuccess = () => {
        let res = idb.result
        let tx = res.transaction('notes', 'readwrite')
        let store = tx.objectStore('notes')
        store.put({
            Title:title,
            Content:content,
            DateTime:currentDate
        })
    }
    document.getElementById("add-note-title").value = null
    document.getElementById("add-note-content").value = null
    document.getElementById("add-note-close").click()
    refreshNotes()
}
let refreshNotes = () => {
    var noteCard = ""
    let idb = indexedDB.open("notes-rcm", 1)

    idb.onupgradeneeded = () => {
        console.error()
        let res = idb.result
        res.createObjectStore('notes',{
            autoIncrement: true
        })
    }

    idb.onsuccess = () => {
        let res = idb.result
        let tx = res.transaction("notes", 'readonly')
        let store = tx.objectStore("notes")
        let cursor = store.openCursor()

        cursor.onsuccess = () => {
            let note = cursor.result
            if (note.value == null){
                document.getElementById("notes").innerHTML = 
                "<h1> no notes </h1>"
            }
            if(note){
                console.log(note.value)
                noteCard = noteCard + `
            <div class="col">
                <div class="card text-center" data-bs-toggle="modal" data-bs-target="#viewNote">
                    <div class="card-body" id="view-note" onclick="viewNote(${note.key})">
                        <h5>${note.value.Title}</h5>
                        <p>${note.value.Content}</p>
                    </div>
                    <div class="card-footer container" id="card-footer">
                        <div class="row align-items-center">
                            <div class="col align-self-center py-2">
                                ${note.value.DateTime}
                            </div>
                        </div>
                        <div class="row align-items-center">
                            <div class="col align-self-center">
                                <button type="button" class="btn btn-warning container-fluid rounded-0"
                                onclick="editNote(${note.key})" id="edit-note" 
                                data-bs-toggle="modal" data-bs-target="#editNoteModal" 
                                >
                                Edit
                                </button>
                            </div>
                            <div class="col align-self-center">
                                <button type="button" class="btn btn-danger container-fluid rounded-0"
                                onclick="deleteNote(${note.key})" id="delete-note" 
                                data-bs-toggle="modal" data-bs-target="#deleteNoteModal" 
                                >
                                Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                `
                document.getElementById("notes").innerHTML = noteCard
                note.continue()
            }
        }
    }
}
refreshNotes()

let viewNote = (key) => {
    let res = idb.result
    let tx = res.transaction("notes", 'readonly')
    let store = tx.objectStore("notes")
    let note = store.get(key)

    note.onsuccess = () =>{
        document.getElementById("viewModalTitle").innerText = note.result.Title
        document.getElementById("viewModalContent").innerText = note.result.Content
        document.getElementById("viewModalDateTime").innerText = note.result.DateTime
    }
}

let editNote = (key) => {

    let idb = indexedDB.open("notes-rcm", 1)
    idb.onsuccess = () => {
        let res = idb.result
        let tx = res.transaction("notes", 'readonly')
        let store = tx.objectStore("notes")
        let note = store.get(key)

        note.onsuccess = () => {
            document.getElementById("edit-note-title").value = note.result.Title
            document.getElementById("edit-note-content").value = note.result.Content
        }
    }
    document.getElementById("editNoteSubmitBtn").onclick = () => {
        let title = document.getElementById("edit-note-title").value
        let content = document.getElementById("edit-note-content").value
        const date = new Date()
        var currentDate = date.toLocaleString()
        let idb = indexedDB.open("notes-rcm",1)
        idb.onsuccess = () => {
            let res = idb.result
            let tx = res.transaction('notes', 'readwrite')
            let store = tx.objectStore('notes')
            store.put({
                Title:title,
                Content:content,
                DateTime:currentDate
            }, key)
        }
        document.getElementById("edit-note-title").value = null
        document.getElementById("edit-note-content").value = null
        document.getElementById("edit-note-close").click()
        refreshNotes() 
    }
}

let deleteNote = (key) => {
    let idb = indexedDB.open("notes-rcm", 1)
    idb.onsuccess = () => {
        let res = idb.result
        let tx = res.transaction("notes", 'readonly')
        let store = tx.objectStore("notes")
        let note = store.get(key)

        note.onsuccess = () => {
            document.getElementById('delete-note-title').innerHTML = 
            `Are you sure? ${note.result.title}`
        
            document.getElementById("deleteNoteSubmitBtn").onclick = () => {
                let idb = indexedDB.open("notes-rcm", 1)

                idb.onsuccess = () => {
                    let res = idb.result
                    let tx = res.transaction("notes", 'readwrite')
                    let store = tx.objectStore("notes")
                    store.delete(key)
                }
                document.getElementById('delete-modal-close').click()
                refreshNotes()
                location.reload(true)
            }
        }
    }
}
