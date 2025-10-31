# Troubleshooting Guide

## Common Issues

### Supabase Connection Error
**Problem**: Cannot connect to Supabase
**Solution**: 
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check Supabase project is active
- Ensure network connectivity

### Data Not Syncing
**Problem**: Local data not syncing with Supabase
**Solution**:
- Check browser console for errors
- Verify Supabase tables exist
- Check Row Level Security policies
- Clear browser cache and reload

### PDF Export Not Working
**Problem**: PDF export fails
**Solution**:
- Ensure jsPDF and html2canvas are installed
- Check browser console for errors
- Try exporting smaller reports first
- Check available disk space

### Performance Issues
**Problem**: App running slowly
**Solution**:
- Clear browser cache
- Reduce number of tasks displayed
- Check network connection
- Upgrade to latest browser version
- Check Supabase query performance

## Getting Help

- Check documentation in FEATURES.md
- Review API documentation in API.md
- Check GitHub issues
- Contact support team
\`\`\`

```json file="" isHidden
