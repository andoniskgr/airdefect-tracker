#!/bin/bash

# Firebase Functions Deployment Script
# This script helps deploy Firebase Functions and configure the project

echo "🚀 Starting Firebase Functions deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Set the project (replace with your actual project ID)
echo "📋 Setting Firebase project to mcc-tracker..."
firebase use mcc-tracker

# Deploy functions
echo "🔧 Deploying Firebase Functions..."
firebase deploy --only functions

# Deploy Firestore rules
echo "🔒 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Test the user management functions in your application"
echo "2. Check the Firebase Console for any errors"
echo "3. Monitor the Functions logs if issues persist"
