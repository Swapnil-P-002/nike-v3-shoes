$images = @{
    "photo-1542291026-7eec264c27ff" = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600";
    "photo-1606107557195-0e29a4b5b4aa" = "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1600";
    "photo-1605348532760-6753d2c43329" = "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1600";
    "photo-1579338559194-a162d19bf842" = "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=1600";
    "photo-1600185365926-3a2ce3cdb9eb" = "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1600";
    "photo-1549298916-b41d501d3772" = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600";
    "photo-1595950653106-6c9ebd614d3a" = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1600";
    "photo-1556906781-9a412961c28c" = "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600";
    "photo-1600185365483-26d7a4cc7519" = "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1600";
    "photo-1608231387042-66d1773070a5" = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1600";
    "photo-1597045566677-8cf032ed6634" = "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1600";
    "photo-1525966222134-fcfa99b8ae77" = "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1600";
    "photo-1515955656352-a1fa3ffcd111" = "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=1600";
    "photo-1551107696-a4b0c5a0d9a2" = "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1600";
    "photo-1539185441755-769473a23570" = "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1600";
    "photo-1560769629-975ec94e6a86" = "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1600";
    "photo-1584735175315-9d5df23860e6" = "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=1600";
    "photo-1571902943202-507ec2618e8f" = "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600";
    "photo-1552674605-db6ffd4facb5"   = "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600";
    "photo-1461896836934-voices"      = "https://images.unsplash.com/photo-1461896836934?w=1600"
}

$destDir = "public/assets/images"
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

foreach ($id in $images.Keys) {
    $url = $images[$id]
    $output = Join-Path $destDir "$id.jpg"
    Write-Host "Downloading $id..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop
        Write-Host "  Success"
    } catch {
        Write-Host "  Error downloading $id from $url : $_"
        # Try without query params if it fails? or with specific w=800
    }
}
