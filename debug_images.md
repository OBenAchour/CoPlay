# Débogage des images Marketplace

## Vérification de l'upload d'images

### 1. Vérifier que l'upload fonctionne
Ouvrez les Developer Tools du navigateur (F12) → Network → Cherchez les requêtes vers `/api/images/upload`

Ce que vous devriez voir :
- **Status**: 200 OK
- **Response body**:
  ```json
  {
    "imageUrl": "http://localhost:8080/uploads/images/uuid.jpg",
    "fileName": "uuid.jpg",
    "error": null
  }
  ```

### 2. Vérifier l'accès direct aux images
Copiez l'URL `imageUrl` de la réponse et ouvrez-la dans un nouvel onglet.
Elle devrait afficher l'image.

### 3. Vérifier les données MongoDB
Connectez-vous à MongoDB Atlas et cherchez l'annonce créée :
```javascript
db.listings.findOne({ title: "titre de votre annonce" })
```

Vérifiez que le champ `images` existe et contient des URLs :
```javascript
{
  "images": [
    "http://localhost:8080/uploads/images/uuid1.jpg",
    "http://localhost:8080/uploads/images/uuid2.jpg"
  ]
}
```

### 4. Vérifier le répertoire d'upload
Dans le répertoire du backend, vérifiez que le dossier `uploads/images/` existe :
```bash
ls -la uploads/images/
```

### 5. Vérifier la configuration
Ouvrez `CoplayBackend/src/main/resources/application.properties` et vérifiez :
```
image.upload.directory=./uploads/images
app.base.url=http://localhost:8080
```

### 6. Vérifier les logs du backend
Dans la console du backend, cherchez des messages liés aux images :
- Image upload success
- Error saving image
- Invalid file type

### 7. Vérifier la sécurité
Ouvrez `CoplayBackend/src/main/java/com/example/coplaybackend/Config/SecurityConfig.java` et vérifiez :
```java
.requestMatchers("/api/images/**").authenticated()
.requestMatchers(HttpMethod.GET, "/uploads/images/**").permitAll()
```

## Erreurs courantes

### ❌ Erreur 404 sur l'image
**Cause**: Le fichier n'existe pas ou l'URL est incorrecte
**Solution**: Vérifiez le répertoire `uploads/images/` et les logs du backend

### ❌ Erreur 403 Forbidden
**Cause**: L'utilisateur n'est pas authentifié pour l'upload
**Solution**: Assurez-vous d'être connecté dans l'application

### ❌ Images vides dans MongoDB
**Cause**: Les URLs ne sont pas correctement stockées lors de la création
**Solution**: Vérifiez la console du navigateur pour voir les données envoyées

### ❌ Erreur CORS
**Cause**: Le navigateur bloque les requêtes cross-origin
**Solution**: Vérifiez que `@CrossOrigin(origins = "http://localhost:4200")` est présent dans ImageController
