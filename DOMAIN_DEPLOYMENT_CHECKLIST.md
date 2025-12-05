# 🌐 KVC Domain Deployment Checklist

**Target Domain**: kvc.ac.th  
**Deployment Date**: [To be scheduled]  
**Status**: ✅ Ready for Deployment

---

## Phase 1: Pre-Deployment (1-2 weeks before)

### Domain & DNS Setup
- [ ] Domain registered (kvc.ac.th)
- [ ] Domain registrar access verified
- [ ] DNS provider setup (Route53, Cloudflare, etc.)
- [ ] Nameservers configured
- [ ] MX records (email) configured
- [ ] SPF/DKIM records added
- [ ] DMARC policy configured

### Server Infrastructure
- [ ] Production server provisioned (VPS/Cloud)
- [ ] Server specs verified (2+ CPU, 4+ GB RAM)
- [ ] Storage capacity verified (50+ GB SSD)
- [ ] Network bandwidth adequate (100+ Mbps)
- [ ] Firewall rules configured
- [ ] SSH access secured
- [ ] Server OS updated (Ubuntu 22.04 LTS recommended)

### SSL/TLS Certificates
- [ ] Decision: Self-signed vs. Let's Encrypt
- [ ] Certificate request submitted (if applicable)
- [ ] Certificate received and validated
- [ ] Private key secured and backed up
- [ ] Certificate chain verified
- [ ] Renewal strategy documented

### Backups & Disaster Recovery
- [ ] Backup location identified
- [ ] Backup storage provisioned
- [ ] Backup encryption enabled
- [ ] Recovery procedure tested
- [ ] Disaster recovery plan documented
- [ ] Team trained on recovery procedures

---

## Phase 2: Pre-Deployment Installation (3-5 days before)

### Docker Environment Setup
- [ ] Docker installed and verified
- [ ] Docker Compose installed and verified
- [ ] Docker daemon running
- [ ] Docker images built locally (test build)
- [ ] Docker Compose file tested locally
- [ ] Resource limits configured

### Database Setup
- [ ] PostgreSQL version selected (16+)
- [ ] Database backup location prepared
- [ ] Backup schedule configured
- [ ] Database user created (non-root)
- [ ] Database replicas planned (if needed)
- [ ] Connection pooling configured

### Environment Configuration
- [ ] Production `.env` file created
- [ ] All secrets generated:
  - [ ] JWT_ACCESS_SECRET (32+ chars)
  - [ ] JWT_REFRESH_SECRET (32+ chars)
  - [ ] COOKIE_SECRET (32+ chars)
  - [ ] Database password
  - [ ] Redis password (if used)
  - [ ] OPENAI_API_KEY (if enabled)
- [ ] CORS origins updated to production domain
- [ ] API base URLs updated
- [ ] Environment variables secured (not in git)

### SSL Certificates Preparation
- [ ] Certificate files placed in `/certs`
- [ ] Permissions set correctly (chmod 600 for keys)
- [ ] Certificate paths in nginx.conf verified
- [ ] Certificate renewal automation setup (if Let's Encrypt)
- [ ] Certificate expiry monitoring configured

---

## Phase 3: Staging Deployment (2-3 days before)

### Staging Environment
- [ ] Staging server provisioned
- [ ] Staging domain/subdomain configured (staging.kvc.ac.th)
- [ ] Staging database created
- [ ] Staging backups configured

### Staging Deployment
- [ ] Clone repository on staging
- [ ] Build Docker images on staging
- [ ] docker-compose up -d on staging
- [ ] Database migrations run
- [ ] Seed data loaded (if applicable)
- [ ] All services healthy

### Staging Testing
- [ ] Frontend loads and renders
- [ ] API endpoints responding
- [ ] Database queries working
- [ ] Real-time features (chat) working
- [ ] Authentication working
- [ ] File uploads working
- [ ] Export functions working
- [ ] Performance acceptable
- [ ] SSL/HTTPS working
- [ ] Logs being written correctly
- [ ] Health checks passing

### Load Testing on Staging
- [ ] Simulate production load (100+ concurrent users)
- [ ] Monitor CPU/memory usage
- [ ] Monitor database connections
- [ ] Monitor API response times
- [ ] Identify bottlenecks
- [ ] Optimize if needed

---

## Phase 4: Production Deployment Day

### Pre-Deployment Final Checks
- [ ] All tests passing on main branch
- [ ] Latest code merged to main
- [ ] Database backup created
- [ ] Rollback plan reviewed
- [ ] Team notified of deployment
- [ ] Maintenance window scheduled (if needed)
- [ ] Stakeholders standing by

### DNS Cutover (30 minutes)
- [ ] Verify staging is fully functional
- [ ] Update DNS A records to point to production server
  - [ ] kvc.ac.th → production-server-ip
  - [ ] www.kvc.ac.th → production-server-ip
- [ ] TTL set to 300 seconds (for faster updates)
- [ ] Monitor DNS propagation

### Production Deployment
- [ ] SSH into production server
- [ ] Clone/pull repository: `git clone <repo> /opt/kvc-fullstack`
- [ ] Navigate to project: `cd /opt/kvc-fullstack`
- [ ] Copy production .env files
- [ ] Edit and set all secrets
- [ ] Build Docker images: `docker-compose build`
- [ ] Start services: `docker-compose up -d`
- [ ] Wait for services to stabilize (60 seconds)

### Database Initialization
- [ ] Verify PostgreSQL container running: `docker-compose ps`
- [ ] Run migrations: `docker-compose exec backend npx prisma migrate deploy`
- [ ] Verify migrations successful
- [ ] Load seed data (if applicable)
- [ ] Verify database connectivity

### Post-Deployment Verification (30 minutes)
- [ ] Check all containers running: `docker-compose ps`
- [ ] Verify backend health: `curl https://kvc.ac.th/api/health`
- [ ] Verify frontend loads: `curl https://kvc.ac.th`
- [ ] Test SSL certificate: `openssl s_client -connect kvc.ac.th:443`
- [ ] Test authentication: Login with test account
- [ ] Test core features:
  - [ ] Create announcement
  - [ ] View grades
  - [ ] Check attendance
  - [ ] Send chat message
  - [ ] Download export
- [ ] Monitor logs for errors: `docker-compose logs -f`
- [ ] Check performance metrics

---

## Phase 5: Post-Deployment (24-48 hours)

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Set up performance monitoring
- [ ] Set up error tracking
- [ ] Set up log aggregation
- [ ] Alert rules configured
- [ ] Team notified of alerts

### User Communication
- [ ] Announcement sent to users
- [ ] Documentation updated
- [ ] Support team briefed
- [ ] Known issues documented

### 24-Hour Observation Period
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Monitor database performance
- [ ] Monitor server resources
- [ ] Address any issues immediately

### Backup Verification
- [ ] Database backup created: `docker-compose exec postgres pg_dump -U postgres kvcdb | gzip > backup.sql.gz`
- [ ] Backup integrity verified
- [ ] Backup stored securely
- [ ] Automated backups verified

### Documentation Updates
- [ ] Deployment log created
- [ ] Issues and resolutions documented
- [ ] Performance metrics recorded
- [ ] Lessons learned documented

---

## Phase 6: Production Optimization (1 week after)

### Performance Tuning
- [ ] Analyze Lighthouse scores
- [ ] Optimize slowest endpoints
- [ ] Review database query performance
- [ ] Optimize images/assets
- [ ] Review bundle sizes
- [ ] Update caching strategies

### Security Hardening
- [ ] Run security scan
- [ ] Review access logs for suspicious activity
- [ ] Verify firewall rules
- [ ] Review CORS policies
- [ ] Verify rate limiting
- [ ] Check for vulnerabilities

### Scaling Preparation
- [ ] Monitor traffic patterns
- [ ] Identify scaling bottlenecks
- [ ] Plan for traffic spikes
- [ ] Document scaling procedures
- [ ] Test auto-scaling policies (if applicable)

---

## Rollback Plan (If Needed)

### Immediate Rollback (< 30 minutes)
```bash
# Stop new deployment
docker-compose down

# Revert DNS
# Update DNS A records back to previous server IP

# Restart previous version
docker-compose -f docker-compose.backup.yml up -d
```

### Database Rollback
```bash
# Stop application
docker-compose down

# Restore database from backup
gunzip < backup-$(date +%Y%m%d).sql.gz | \
  docker-compose exec -T postgres psql -U postgres kvcdb

# Restart
docker-compose up -d
```

### Full Rollback
```bash
# DNS rollback
# Point A records back to old server

# Restart old application
ssh old-server "systemctl start kvc-app"

# Monitor for 24 hours
```

---

## Communication Plan

### Before Deployment (1 week)
- [ ] Email users about maintenance window
- [ ] Post announcement on website
- [ ] Brief support team
- [ ] Notify stakeholders

### Day Before
- [ ] Final reminder email
- [ ] Confirm all systems ready
- [ ] Team standby confirmation

### Deployment Day
- [ ] Team online and ready
- [ ] Support team on standby
- [ ] Document issues in real-time

### After Deployment
- [ ] User confirmation email
- [ ] Update status page
- [ ] Thank you message
- [ ] Feedback survey

---

## Success Criteria

### Deployment Success
- ✅ All services running without errors
- ✅ No failed containers
- ✅ Database connected and responding
- ✅ API responding to requests
- ✅ Frontend loads and renders
- ✅ SSL certificate valid and trusted
- ✅ All core features working
- ✅ No error messages in logs

### Performance Success
- ✅ Page load time < 1 second
- ✅ API response time < 100ms
- ✅ Lighthouse score > 85
- ✅ No memory leaks
- ✅ Database queries < 50ms
- ✅ No timeout errors

### User Success
- ✅ No user-reported issues after 24 hours
- ✅ Positive feedback received
- ✅ Login working for all users
- ✅ Data integrity verified
- ✅ All features accessible

---

## Contact & Escalation

### Deployment Team
- **Lead**: [Name, Email, Phone]
- **Backend**: [Name, Email, Phone]
- **Frontend**: [Name, Email, Phone]
- **DevOps**: [Name, Email, Phone]
- **DBA**: [Name, Email, Phone]

### On-Call Support
- **24/7 On-Call**: [Name, Phone]
- **Escalation**: [Manager, Phone]

### External Contacts
- **Domain Registrar**: [Contact info]
- **SSL Provider**: [Contact info]
- **Hosting Provider**: [Contact info]

---

## Deployment Timeline (Example)

```
Day -7:  Pre-deployment checks complete
Day -3:  Staging deployment & testing
Day -1:  Final staging verification
Day 0:   
  09:00  Team briefing
  10:00  DNS cutover preparation
  10:30  DNS updated
  10:45  Production deployment begins
  11:15  All services verified
  11:30  Announcement sent to users
  12:00  Deployment complete - monitoring begins
Day +1:  24-hour observation complete
Day +7:  Performance optimization complete
```

---

## Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Manager | | | |
| Tech Lead | | | |
| DevOps Lead | | | |
| QA Lead | | | |
| Security Officer | | | |

---

## Post-Deployment Review

- [ ] All success criteria met
- [ ] No critical issues
- [ ] User feedback positive
- [ ] Performance acceptable
- [ ] Team debriefing completed
- [ ] Lessons learned documented
- [ ] Deployment marked as successful

---

**Status**: ✅ Ready for Domain Deployment  
**Next Steps**: Schedule deployment date and notify team  
**Estimated Deployment Duration**: 2-3 hours  
**Estimated Downtime**: < 5 minutes (DNS propagation)

🚀 **Ready to Launch!**
