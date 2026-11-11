# AWS Deployment Guide

## AWS Cloud-Based Event & Ticket Booking System

This guide covers deploying the complete application to AWS using core services.

---

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Domain name (optional, for HTTPS)
- SSL Certificate in ACM (optional, for HTTPS)
- Key pair for EC2 SSH access

---

## 🏗️ Architecture Overview

```
Internet Users
      │
      ▼
┌─────────────────┐
│  CloudFront     │  (Optional: Custom Domain + HTTPS)
│  (S3 Origin)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Application    │
│  Load Balancer  │  (Internet-facing, HTTPS)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ EC2   │ │ EC2   │  (Private Subnets, AZ-1 & AZ-2)
│ AZ-1  │ │ AZ-2  │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│  Amazon RDS     │  (Private DB Subnets, Multi-AZ)
│  PostgreSQL     │
└─────────────────┘
```

---

## Phase 5A: VPC & Networking

### 1. Create VPC
```bash
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=eventflow-vpc}]'
# Save VPC ID: vpc-xxxxxxxxx
```

### 2. Create Subnets (2 AZs)
```bash
# Public Subnet AZ-1
aws ec2 create-subnet \
  --vpc-id vpc-xxxxxxxxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=eventflow-public-1a}]'

# Public Subnet AZ-2
aws ec2 create-subnet \
  --vpc-id vpc-xxxxxxxxx \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=eventflow-public-1b}]'

# Private App Subnet AZ-1
aws ec2 create-subnet \
  --vpc-id vpc-xxxxxxxxx \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=eventflow-app-1a}]'

# Private App Subnet AZ-2
aws ec2 create-subnet \
  --vpc-id vpc-xxxxxxxxx \
  --cidr-block 10.0.12.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=eventflow-app-1b}]'

# Private DB Subnet AZ-1
aws ec2 create-subnet \
  --vpc-id vpc-xxxxxxxxx \
  --cidr-block 10.0.21.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=eventflow-db-1a}]'

# Private DB Subnet AZ-2
aws ec2 create-subnet \
  --vpc-id vpc-xxxxxxxxx \
  --cidr-block 10.0.22.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=eventflow-db-1b}]'
```

### 3. Internet Gateway & NAT Gateway
```bash
# Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=eventflow-igw}]'
# Save IGW ID: igw-xxxxxxxxx

aws ec2 attach-internet-gateway --vpc-id vpc-xxxxxxxxx --internet-gateway-id igw-xxxxxxxxx

# Elastic IP for NAT Gateway
aws ec2 allocate-address --domain vpc
# Save Allocation ID: eipalloc-xxxxxxxxx

# NAT Gateway
aws ec2 create-nat-gateway \
  --subnet-id subnet-xxxxxxxxx (public-1a) \
  --allocation-id eipalloc-xxxxxxxxx \
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=eventflow-nat}]'
# Save NAT Gateway ID: nat-xxxxxxxxx
```

### 4. Route Tables
```bash
# Public Route Table
aws ec2 create-route-table --vpc-id vpc-xxxxxxxxx
# Save RT ID: rtb-public
aws ec2 create-route --route-table-id rtb-public --destination-cidr-block 0.0.0.0/0 --gateway-id igw-xxxxxxxxx
aws ec2 associate-route-table --route-table-id rtb-public --subnet-id subnet-public-1a
aws ec2 associate-route-table --route-table-id rtb-public --subnet-id subnet-public-1b

# Private App Route Table
aws ec2 create-route-table --vpc-id vpc-xxxxxxxxx
# Save RT ID: rtb-app
aws ec2 create-route --route-table-id rtb-app --destination-cidr-block 0.0.0.0/0 --nat-gateway-id nat-xxxxxxxxx
aws ec2 associate-route-table --route-table-id rtb-app --subnet-id subnet-app-1a
aws ec2 associate-route-table --route-table-id rtb-app --subnet-id subnet-app-1b

# Private DB Route Table (no internet access)
aws ec2 create-route-table --vpc-id vpc-xxxxxxxxx
# Save RT ID: rtb-db
aws ec2 associate-route-table --route-table-id rtb-db --subnet-id subnet-db-1a
aws ec2 associate-route-table --route-table-id rtb-db --subnet-id subnet-db-1b
```

---

## Phase 5B: Security Groups

### 1. ALB Security Group
```bash
aws ec2 create-security-group \
  --group-name eventflow-alb-sg \
  --description "ALB Security Group" \
  --vpc-id vpc-xxxxxxxxx
# Save SG ID: sg-alb

aws ec2 authorize-security-group-ingress \
  --group-id sg-alb \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-alb \
  --protocol tcp --port 443 --cidr 0.0.0.0/0
```

### 2. EC2 Backend Security Group
```bash
aws ec2 create-security-group \
  --group-name eventflow-backend-sg \
  --description "Backend EC2 Security Group" \
  --vpc-id vpc-xxxxxxxxx
# Save SG ID: sg-backend

# Allow traffic from ALB only
aws ec2 authorize-security-group-ingress \
  --group-id sg-backend \
  --protocol tcp --port 5000 --source-group sg-alb

# Allow SSH from your IP (optional)
aws ec2 authorize-security-group-ingress \
  --group-id sg-backend \
  --protocol tcp --port 22 --cidr YOUR_IP/32
```

### 3. RDS Security Group
```bash
aws ec2 create-security-group \
  --group-name eventflow-rds-sg \
  --description "RDS Security Group" \
  --vpc-id vpc-xxxxxxxxx
# Save SG ID: sg-rds

# Allow traffic from backend SG only
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds \
  --protocol tcp --port 5432 --source-group sg-backend
```

---

## Phase 5C: RDS PostgreSQL

### 1. DB Subnet Group
```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name eventflow-db-subnet-group \
  --db-subnet-group-description "EventFlow DB Subnet Group" \
  --subnet-ids subnet-db-1a subnet-db-1b
```

### 2. Create RDS Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier eventflow-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --max-allocated-storage 100 \
  --db-subnet-group-name eventflow-db-subnet-group \
  --vpc-security-group-ids sg-rds \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted \
  --deletion-protection \
  --tags Key=Name,Value=eventflow-db
```

### 3. Wait for RDS to be Available
```bash
aws rds wait db-instance-available --db-instance-identifier eventflow-db
```

### 4. Get Endpoint
```bash
aws rds describe-db-instances --db-instance-identifier eventflow-db \
  --query 'DBInstances[0].Endpoint.Address' --output text
# Save: eventflow-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
```

---

## Phase 5D: EC2 Backend Instances

### 1. Create IAM Role for EC2
```bash
# Trust Policy
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
  --role-name eventflow-ec2-role \
  --assume-role-policy-document file://trust-policy.json

# Attach Policies
aws iam attach-role-policy --role-name eventflow-ec2-role --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy
aws iam attach-role-policy --role-name eventflow-ec2-role --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Create Instance Profile
aws iam create-instance-profile --instance-profile-name eventflow-ec2-profile
aws iam add-role-to-instance-profile --instance-profile-name eventflow-ec2-profile --role-name eventflow-ec2-role
```

### 2. Create Launch Template
```bash
cat > user-data.sh << 'EOF'
#!/bin/bash
yum update -y
yum install -y nodejs npm postgresql15

# Install PM2 globally
npm install -g pm2

# Create app directory
mkdir -p /opt/eventflow
cd /opt/eventflow

# Clone repository (replace with your repo)
# git clone https://github.com/yourusername/eventflow.git .

# For now, we'll create the files manually or use S3
# This is a placeholder - in production use CodeDeploy or S3

# Install CloudWatch Agent
yum install -y amazon-cloudwatch-agent
EOF

aws ec2 create-launch-template \
  --launch-template-name eventflow-backend-template \
  --version-description "v1" \
  --launch-template-data '{
    "ImageId": "ami-0c02fb55956c7d316",
    "InstanceType": "t3.micro",
    "KeyName": "your-key-pair",
    "SecurityGroupIds": ["sg-backend"],
    "IamInstanceProfile": {"Name": "eventflow-ec2-profile"},
    "UserData": "'"$(base64 -w 0 user-data.sh)"'",
    "TagSpecifications": [{
      "ResourceType": "instance",
      "Tags": [{"Key": "Name", "Value": "eventflow-backend"}]
    }]
  }'
```

### 3. Launch Two Instances
```bash
# Instance 1 (AZ-1)
aws ec2 run-instances \
  --launch-template LaunchTemplateName=eventflow-backend-template,Version='$Latest' \
  --subnet-id subnet-app-1a \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=eventflow-backend-1},{Key=InstanceId,Value=backend-instance-1}]' \
  --count 1

# Instance 2 (AZ-2)
aws ec2 run-instances \
  --launch-template LaunchTemplateName=eventflow-backend-template,Version='$Latest' \
  --subnet-id subnet-app-1b \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=eventflow-backend-2},{Key=InstanceId,Value=backend-instance-2}]' \
  --count 1
```

### 4. Deploy Backend Code (Manual or Automation)
```bash
# On each EC2 instance (via SSH or SSM):
cd /opt/eventflow

# Create .env file
cat > .env << 'ENVEOF'
PORT=5000
NODE_ENV=production
JWT_SECRET=your-production-secret-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
CORS_ORIGIN=https://yourdomain.com
INSTANCE_ID=backend-instance-1  # Use backend-instance-2 for second instance
DATABASE_URL=postgresql://admin:password@eventflow-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/event_booking?schema=public
AWS_REGION=us-east-1
ENVEOF

# Install dependencies and build
npm ci --production
npx prisma generate
npx prisma migrate deploy

# Start with PM2
pm2 start src/server.js --name eventflow-backend
pm2 startup
pm2 save
```

---

## Phase 5E: Application Load Balancer

### 1. Create Target Group
```bash
aws elbv2 create-target-group \
  --name eventflow-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxxxxxxxx \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --target-type instance
# Save TG ARN: arn:aws:elasticloadbalancing:...
```

### 2. Register Targets
```bash
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --targets Id=i-instance1 Id=i-instance2
```

### 3. Create ALB
```bash
aws elbv2 create-load-balancer \
  --name eventflow-alb \
  --subnets subnet-public-1a subnet-public-1b \
  --security-groups sg-alb \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4
# Save ALB ARN and DNS Name
```

### 4. Create Listener (HTTP -> HTTPS Redirect)
```bash
# HTTP Listener (redirect to HTTPS)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}

# HTTPS Listener (requires ACM certificate)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

## Phase 6: Frontend Deployment (S3 + CloudFront)

### 1. Build Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_URL=https://your-alb-dns.amazonaws.com/api
npm ci
npm run build
```

### 2. Create S3 Bucket
```bash
aws s3 mb s3://eventflow-frontend-bucket --region us-east-1

# Configure static website hosting
aws s3 website s3://eventflow-frontend-bucket \
  --index-document index.html \
  --error-document index.html

# Upload build
aws s3 sync dist/ s3://eventflow-frontend-bucket --delete

# Bucket policy for public read
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::eventflow-frontend-bucket/*"
  }]
}
EOF

aws s3api put-bucket-policy --bucket eventflow-frontend-bucket --policy file://bucket-policy.json
```

### 3. Create CloudFront Distribution
```bash
cat > cloudfront-config.json << 'EOF'
{
  "CallerReference": "eventflow-frontend-$(date +%s)",
  "Comment": "EventFlow Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-eventflow-frontend-bucket",
      "DomainName": "eventflow-frontend-bucket.s3.amazonaws.com",
      "S3OriginConfig": {"OriginAccessIdentity": ""}
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-eventflow-frontend-bucket",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"], "CachedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]}},
    "ForwardedValues": {"QueryString": false, "Cookies": {"Forward": "none"}},
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {"ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 300},
      {"ErrorCode": 404, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 300}
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_All"
}
EOF

aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

---

## Phase 7: Monitoring & Security

### 1. CloudWatch Log Group
```bash
aws logs create-log-group --log-group-name /aws/ec2/eventflow-backend
aws logs put-retention-policy --log-group-name /aws/ec2/eventflow-backend --retention-in-days 30
```

### 2. CloudWatch Alarms
```bash
# High CPU Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name EventFlow-HighCPU \
  --alarm-description "CPU > 80% for 5 minutes" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=AutoScalingGroupName,Value=eventflow-asg \
  --alarm-actions arn:aws:sns:us-east-1:xxxxxxxxxx:eventflow-alerts

# ALB Unhealthy Hosts
aws cloudwatch put-metric-alarm \
  --alarm-name EventFlow-UnhealthyHosts \
  --alarm-description "Unhealthy hosts > 0" \
  --metric-name UnHealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Maximum \
  --period 60 \
  --threshold 0 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=LoadBalancer,Value=app/eventflow-alb/xxxxxx \
  --alarm-actions arn:aws:sns:us-east-1:xxxxxxxxxx:eventflow-alerts

# ALB 5xx Errors
aws cloudwatch put-metric-alarm \
  --alarm-name EventFlow-5xxErrors \
  --alarm-description "5xx errors > 1%" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=LoadBalancer,Value=app/eventflow-alb/xxxxxx \
  --alarm-actions arn:aws:sns:us-east-1:xxxxxxxxxx:eventflow-alerts
```

### 3. RDS Enhanced Monitoring
```bash
aws rds modify-db-instance \
  --db-instance-identifier eventflow-db \
  --monitoring-interval 60 \
  --monitoring-role-arn arn:aws:iam::xxxxxxxxxx:role/rds-monitoring-role
```

---

## 🧪 Verification Checklist

### Backend Health
- [ ] `curl https://alb-dns/api/health` returns healthy
- [ ] `curl https://alb-dns/api/instance` returns instance ID
- [ ] Multiple requests show load balancing between instances

### Frontend
- [ ] CloudFront URL loads landing page
- [ ] Login/Register works
- [ ] Event listing loads
- [ ] Booking flow completes
- [ ] Dashboard accessible

### Database
- [ ] RDS accessible from EC2 only
- [ ] Migrations applied
- [ ] Seed data present

### Monitoring
- [ ] CloudWatch logs receiving application logs
- [ ] Alarms configured and tested
- [ ] Dashboard created with key metrics

---

## 💰 Estimated Monthly Costs (us-east-1)

| Service | Configuration | Est. Cost |
|---------|--------------|-----------|
| EC2 (2x t3.micro) | On-Demand, 730 hrs | ~$15 |
| RDS (db.t3.micro, Multi-AZ) | 20 GB GP3, 7-day backup | ~$35 |
| ALB | 1 LCU, 730 hrs | ~$18 |
| CloudFront | 1 TB transfer, 10M requests | ~$10 |
| S3 | 1 GB storage, 10 GB transfer | ~$1 |
| CloudWatch | Logs, 10 custom metrics, 5 alarms | ~$5 |
| Data Transfer | Inter-AZ, Internet | ~$5 |
| **Total** | | **~$89/month** |

**Cost Optimization:**
- Use EC2 Spot Instances (~70% savings)
- RDS Reserved Instances (~30-60% savings)
- Single-AZ RDS for dev (~50% savings)
- CloudWatch Free Tier (10 custom metrics, 10 alarms)

---

## 🔐 Security Checklist

- [ ] RDS not publicly accessible
- [ ] Security groups restrict traffic to minimum required
- [ ] IAM roles used (no hardcoded credentials)
- [ ] HTTPS enforced on ALB and CloudFront
- [ ] JWT secret rotated and stored securely
- [ ] Database password in Secrets Manager (production)
- [ ] WAF rules on ALB (optional)
- [ ] Regular security updates on EC2

---

## 🚀 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to EC2 via SSM
        # Use AWS SSM SendCommand or CodeDeploy
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and Deploy to S3
        run: |
          npm ci && npm run build
          aws s3 sync dist/ s3://eventflow-frontend-bucket --delete
          aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"
```

---

## 📞 Support & Troubleshooting

### Common Issues

1. **ALB Health Checks Failing**
   - Verify security group allows ALB → EC2 on port 5000
   - Check `/api/health` endpoint returns 200
   - Ensure backend is running on all instances

2. **Database Connection Timeout**
   - Verify RDS security group allows EC2 SG on 5432
   - Check VPC routing (DB subnets have no internet)
   - Confirm DATABASE_URL uses internal endpoint

3. **Frontend API Calls Fail**
   - Check CORS_ORIGIN matches CloudFront domain
   - Verify VITE_API_URL points to ALB DNS
   - Check browser console for errors

4. **Load Balancing Not Working**
   - Verify both instances registered in target group
   - Check health check path matches `/api/health`
   - Ensure instances return different instanceId

### Useful Commands
```bash
# Check ALB target health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:...

# View EC2 logs
aws logs tail /aws/ec2/eventflow-backend --follow

# Test database connectivity from EC2
psql "postgresql://admin:password@eventflow-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/event_booking"

# PM2 commands on EC2
pm2 status
pm2 logs eventflow-backend
pm2 restart eventflow-backend
```

---

## 📚 Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [EC2 User Data Best Practices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html)
- [RDS PostgreSQL Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [ALB Target Group Health Checks](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html)
- [CloudFront with S3 Origin](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/getting-started-s3.html)

---

*Last Updated: $(date)*
*Version: 1.0*