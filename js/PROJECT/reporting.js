        async function handleLogout() {
            if (!confirm("Are you sure you want to log out?")) return;
            try {
                const response = await fetch('/api/logout', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = '/login';
            } else {
                alert("Logout failed: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            alert("An error occurred while trying to log out.");
        }
    }
        
        document.addEventListener('DOMContentLoaded', function() {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    navItems.forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            const reviewForm = document.querySelector('.review-form');
            if (reviewForm) {
                reviewForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    alert('Your review has been submitted successfully!');
                    this.reset();
                });
            }
            const loadMoreBtn = document.querySelector('.load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', function() {
                    alert('Loading more reviews...');
                });
            }
            const ratingLabels = document.querySelectorAll('.review-rating label');
            if (ratingLabels.length > 0) {
                ratingLabels.forEach((label, index) => {
                    label.addEventListener('click', function() {
                        ratingLabels.forEach(l => l.classList.remove('selected'));
                        for (let i = 0; i <= index; i++) {
                            ratingLabels[i].classList.add('selected');
                        }
                        const input = document.getElementById(`star${index + 1}`);
                        if (input) {
                            input.checked = true;
                        }
                    });
                });
            }

            const userProfileIcon = document.querySelector('.user-profile-icon');
            const rightSidebar = document.getElementById('rightSidebar');
            const closeSidebar = document.getElementById('closeSidebar');

            if (userProfileIcon && rightSidebar) {
                userProfileIcon.addEventListener('click', function() {
                    rightSidebar.classList.add('open');
                });
            }

            if (closeSidebar && rightSidebar) {
                closeSidebar.addEventListener('click', function() {
                    rightSidebar.classList.remove('open');
                });
            }

            document.addEventListener('click', function(e) {
                if (rightSidebar && rightSidebar.classList.contains('open') &&
                    !rightSidebar.contains(e.target) &&
                    !userProfileIcon.contains(e.target)) {
                    rightSidebar.classList.remove('open');
                }
            });
        });
// ============================================
// REPORT FORM SUBMISSION
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    // --- Report Type Selection ---
    let selectedType = '';
    const reportOptions = document.querySelectorAll('.report-option');

    reportOptions.forEach(option => {
        option.addEventListener('click', function () {
            reportOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedType = this.querySelector('h3').textContent;
        });
    });

    // --- Severity Color Change ---
    const severityInputs = document.querySelectorAll('input[name="severity"]');
    const formSection = document.querySelector('.form-section');
    const severityFeedback = document.createElement('div');
    severityFeedback.classList.add('severity-feedback');
    if (formSection) formSection.appendChild(severityFeedback);

    severityInputs.forEach(input => {
        input.addEventListener('change', function () {
            formSection.classList.remove('severity-low', 'severity-medium', 'severity-high');
            formSection.classList.add('severity-' + this.id);
            severityFeedback.classList.remove('show', 'severity-low', 'severity-medium', 'severity-high');

            if (this.id === 'low') {
                severityFeedback.textContent = '✅ Low severity — will be reviewed within 48 hours.';
            } else if (this.id === 'medium') {
                severityFeedback.textContent = '⚠️ Medium severity — will be reviewed within 24 hours.';
            } else if (this.id === 'high') {
                severityFeedback.textContent = '🚨 High severity — urgent! Team will be notified immediately.';
            }

            severityFeedback.classList.add('show', 'severity-' + this.id);
        });
    });

    // --- File Upload Display ---
    const fileInput = document.getElementById('fileInput');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    const fileUploadArea = document.getElementById('fileUploadArea');

    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', function () {
            this.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('dragover');
            fileInput.files = e.dataTransfer.files;
            displayUploadedFiles(e.dataTransfer.files);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            displayUploadedFiles(this.files);
        });
    }

    function displayUploadedFiles(files) {
        uploadedFilesContainer.innerHTML = '';
        Array.from(files).forEach(file => {
            const size = (file.size / 1024).toFixed(1) + ' KB';
            const item = document.createElement('div');
            item.classList.add('file-item');
            item.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">📎</span>
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${size}</span>
                    </div>
                </div>`;
            uploadedFilesContainer.appendChild(item);
        });
    }

    // --- Emergency Button ---
    const emergencyBtn = document.querySelector('.emergency-btn');
    const confirmModal = document.getElementById('confirmModal');

    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function () {
            confirmModal.style.display = 'block';
        });
    }

    window.closeConfirmModal = function () {
        confirmModal.style.display = 'none';
    };

    window.sendEmergencyAlert = function () {
        confirmModal.style.display = 'none';
        document.getElementById('successModal').style.display = 'block';
    };

    window.closeSuccessModal = function () {
        document.getElementById('successModal').style.display = 'none';
    };

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            const icon = this.querySelector('.toggle-icon');
            icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        });
    }

    // --- Bus Number Validation ---
    const busNumberInput = document.getElementById('busNumber');
    const busNumberError = document.getElementById('busNumberError');
    const busPattern = /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/;

    if (busNumberInput) {
        busNumberInput.addEventListener('input', function () {
            const value = this.value.toUpperCase();
            this.value = value;

            if (value === '') {
                this.classList.remove('valid', 'invalid');
                busNumberError.classList.remove('show');
            } else if (busPattern.test(value)) {
                this.classList.add('valid');
                this.classList.remove('invalid');
                busNumberError.classList.remove('show');
            } else {
                this.classList.add('invalid');
                this.classList.remove('valid');
                busNumberError.textContent = '❌ Format should be like: PB-01-B-2946';
                busNumberError.classList.add('show');
            }
        });
    }

    // --- FORM SUBMISSION (THE IMPORTANT PART) ---
    const reportForm = document.querySelector('.form-section form');
    const formMessage = document.createElement('div');
    formMessage.classList.add('form-message');
    if (reportForm) reportForm.appendChild(formMessage);

    if (reportForm) {
        reportForm.addEventListener('submit', async function (e) {
            e.preventDefault();  // stops page from refreshing

            // Check report type is selected
            if (!selectedType) {
                alert('Please select a report type first (Rash Driving, Bus Condition, etc.)');
                return;
            }

            // Check bus number format
            const busVal = document.getElementById('busNumber').value;
            if (!busPattern.test(busVal)) {
                alert('Please enter a valid bus number. Format: PB-01-B-2946');
                return;
            }

            // Show loading message
            formMessage.className = 'form-message loading';
            formMessage.textContent = 'Submitting your report...';

            // Build FormData — this can carry both text AND files
            // This is different from JSON which can only carry text
            const formData = new FormData();
            formData.append('reportType', selectedType);
            formData.append('busNumber', busVal);
            formData.append('location', document.querySelector('input[placeholder="Nearest bus stop or landmark"]').value);
            formData.append('date', document.querySelector('input[type="date"]').value);
            formData.append('time', document.querySelector('input[type="time"]').value);
            formData.append('description', document.querySelector('textarea').value);
            formData.append('severity', document.querySelector('input[name="severity"]:checked')?.value || '');
            formData.append('rating', document.querySelector('input[name="rating"]:checked')?.value || 'Not rated');

            // Attach file if user uploaded one
            if (fileInput && fileInput.files[0]) {
                formData.append('evidence', fileInput.files[0]);
            }

            try {
                const response = await fetch('/reports', {
                    method: 'POST',
                    // NO Content-Type header here — browser sets it automatically for FormData
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    // Show success message
                    formMessage.className = 'form-message success';
                    formMessage.textContent = '✅ Report submitted successfully!';
                    reportForm.reset();
                    selectedType = '';
                    reportOptions.forEach(o => o.classList.remove('selected'));
                    uploadedFilesContainer.innerHTML = '';

                    // Load updated reports list
                    loadReports();
                } else {
                    formMessage.className = 'form-message error';
                    formMessage.textContent = '❌ ' + (data.message || 'Something went wrong.');
                }

            } catch (error) {
                formMessage.className = 'form-message error';
                formMessage.textContent = '❌ Network error. Please try again.';
                console.error('Submit error:', error);
            }
        });
    }

    // --- LOAD AND DISPLAY SUBMITTED REPORTS ---
    async function loadReports() {
        try {
            const response = await fetch('/reports');
            const reports = await response.json();
            const container = document.getElementById('reportsContainer');
            if (!container) return;

            if (reports.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:#999;">No reports submitted yet.</p>';
                return;
            }

            container.innerHTML = reports.map(report => `
                <div class="report-card">
                    <div class="report-header">
                        <span class="report-type">${report.reportType}</span>
                        <span class="report-severity severity-${report.severity}">${report.severity}</span>
                    </div>
                    <div class="report-body">
                        <p><strong>Bus:</strong> ${report.busNumber}</p>
                        <p><strong>Location:</strong> ${report.location}</p>
                        <p><strong>Date:</strong> ${report.date} at ${report.time}</p>
                        <p><strong>Description:</strong> ${report.description}</p>
                        <p><strong>Submitted by:</strong> ${report.submittedBy}</p>
                        <p><strong>Rating:</strong> ${report.rating}</p>
                        ${report.evidenceUrl ? `<p><strong>Evidence:</strong> <a href="${report.evidenceUrl}" target="_blank">View Uploaded File</a></p>` : ''}
                        ${report.mirroredToPostgres ? '<p style="color:#10b981; font-size:13px;">✅ Also saved to PostgreSQL</p>' : ''}
                    </div>
                    <button class="delete-btn" onclick="deleteReport('${report._id}')">🗑️ Delete</button>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading reports:', error);
        }
    }

    // --- DELETE REPORT ---
    window.deleteReport = async function (id) {
        if (!confirm('Are you sure you want to delete this report?')) return;

        try {
            const response = await fetch(`/reports/${id}`, { method: 'DELETE' });
            const data = await response.json();

            if (data.success) {
                loadReports();
            } else {
                alert('Failed to delete: ' + data.message);
            }
        } catch (error) {
            alert('Error deleting report.');
        }
    };

    // Load reports when page opens
    loadReports();

});