# Coolify GitHub Authentication Fix

## Problem
```
Deployment failed: fatal: could not read Username for 'https://github.com': No such device or address
```

This error occurs when Coolify tries to clone a private GitHub repository without proper authentication.

## ✅ Solution 1: Configure GitHub App (Recommended)

### Step 1: Add GitHub Source in Coolify

1. Log into Coolify dashboard
2. Click **"Sources"** in the top navigation
3. Click **"+ New"** or **"Add Source"**
4. Select **"GitHub"**
5. Choose **"GitHub App"** (preferred) or **"GitHub OAuth"**

### Step 2: Install Coolify GitHub App

1. You'll be redirected to GitHub
2. Click **"Install Coolify"** (or your Coolify instance name)
3. Choose where to install:
   - **Option A**: Select specific repositories → Choose `sharekit-prd-playbook`
   - **Option B**: All repositories (if you plan to deploy more)
4. Click **"Install"**
5. Authorize the app

### Step 3: Update Your Edge Functions Resource

1. Go to your Coolify project
2. Find your **edge-functions** resource
3. Click on it to open settings
4. Go to **"General"** or **"Source"** tab
5. Find **"Source"** dropdown
6. Select the GitHub App source you just configured
7. Verify repository: `dj-pearson/sharekit-prd-playbook`
8. Verify branch: `main`
9. Click **"Save"**

### Step 4: Deploy

1. Click **"Deploy"** button
2. Watch the logs - you should see:
   ```
   Cloning repository...
   Checking out main branch...
   Building Docker image...
   ```

## ✅ Solution 2: Personal Access Token (Alternative)

### Step 1: Create GitHub PAT

1. Go to GitHub → Settings (your profile settings)
2. Developer settings → Personal access tokens → Tokens (classic)
3. Click **"Generate new token (classic)"**
4. Give it a name: `Coolify Edge Functions`
5. Select scopes:
   - ✅ `repo` (full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

### Step 2: Configure in Coolify

**Method A: Via Source Configuration**
1. Coolify → Sources → Add New
2. Select "GitHub"
3. Provide:
   - Name: `GitHub PAT`
   - API URL: `https://api.github.com`
   - Type: Personal Access Token
   - Token: Paste your token
4. Save

**Method B: Via Resource Settings**
1. Go to your edge-functions resource
2. Look for "Private Repository" or "Authentication" settings
3. Enable private repository access
4. Add credentials:
   - Username: `dj-pearson` (your GitHub username)
   - Token: Your PAT

### Step 3: Update Repository URL

If using PAT directly in URL (not recommended, but works):
```
https://YOUR_USERNAME:YOUR_TOKEN@github.com/dj-pearson/sharekit-prd-playbook
```

Replace in Coolify resource settings, then deploy.

## ✅ Solution 3: Use SSH Instead

### Step 1: Generate SSH Key in Coolify

1. Coolify → Settings → SSH Keys
2. If no key exists, generate one
3. Copy the **public key**

### Step 2: Add to GitHub

1. GitHub → Settings → SSH and GPG keys
2. Click **"New SSH key"**
3. Title: `Coolify Server`
4. Paste the public key
5. Click **"Add SSH key"**

### Step 3: Update Resource

1. Go to your edge-functions resource
2. Change repository URL from:
   ```
   https://github.com/dj-pearson/sharekit-prd-playbook
   ```
   to:
   ```
   git@github.com:dj-pearson/sharekit-prd-playbook.git
   ```
3. Save and deploy

## ✅ Solution 4: Make Repository Public (Quick Test)

**Only if the code is not sensitive:**

1. GitHub → Repository → Settings
2. Scroll to **"Danger Zone"**
3. Click **"Change visibility"**
4. Select **"Make public"**
5. Confirm
6. Redeploy in Coolify (no auth needed now)

## 🔍 Verify Current Configuration

### Check Your Resource Settings

1. Go to Coolify → Your edge-functions resource
2. Note these details:
   - Repository URL: `_______________________`
   - Branch: `_______________________`
   - Source type: `_______________________`
   - Authentication: `_______________________`

### Test Git Clone Manually

SSH into your Coolify server and test:

```bash
# Test HTTPS (without auth - should fail)
git ls-remote https://github.com/dj-pearson/sharekit-prd-playbook

# Test SSH (if configured)
git ls-remote git@github.com:dj-pearson/sharekit-prd-playbook.git
```

## 🎯 Recommended Approach

**For production deployments:**

1. ✅ Use **GitHub App** (Solution 1) - Most secure, easiest to maintain
2. ✅ Or use **SSH** (Solution 3) - Traditional, very secure
3. ⚠️ Use **PAT** (Solution 2) only if GitHub App isn't available
4. ❌ Avoid making repo public unless absolutely acceptable

## 📝 After Fixing

Once authentication is configured:

1. **Test deployment**: Click Deploy and verify logs
2. **Check health endpoint**: 
   ```bash
   curl https://your-functions-domain/health
   ```
3. **Continue with checklist**: Return to `EDGE_FUNCTIONS_DEPLOYMENT_CHECKLIST.md`

## 🆘 Still Having Issues?

### Common Problems

**"Permission denied (publickey)"** with SSH:
- SSH key not added to GitHub
- Wrong SSH key configured in Coolify
- Solution: Verify SSH key is in GitHub settings

**"Bad credentials"** with PAT:
- Token expired or revoked
- Wrong token copied
- Insufficient scopes
- Solution: Generate new token with `repo` scope

**"Repository not found"**:
- Wrong repository URL
- No access to repository
- Repository deleted
- Solution: Verify URL and access

### Get More Help

1. **Coolify Logs**: Check the full deployment logs for more details
2. **Coolify Docs**: https://coolify.io/docs
3. **GitHub Status**: https://www.githubstatus.com/

## ✨ Success Indicators

After fixing, you should see in Coolify logs:

```
✅ Cloning repository...
✅ Cloning into '/tmp/xxxxx'...
✅ Checking out main branch...
✅ HEAD is now at xxxxxxx Add Edge Functions Docker setup
✅ Building Docker image...
```

Then proceed with your deployment! 🚀

