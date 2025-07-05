document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    const initCharts = () => {
        // Views Chart (YouTube)
        const viewsCtx = document.getElementById('viewsChart').getContext('2d');
        new Chart(viewsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Views',
                    data: [120, 190, 170, 220, 210, 245],
                    borderColor: '#FF0000',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });

        // Engagement Chart (Instagram)
        const engagementCtx = document.getElementById('engagementChart').getContext('2d');
        new Chart(engagementCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Engagement',
                    data: [65, 59, 70, 71, 76, 78],
                    borderColor: '#C13584',
                    backgroundColor: 'rgba(193, 53, 132, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });

        // Shares Chart (TikTok)
        const sharesCtx = document.getElementById('sharesChart').getContext('2d');
        new Chart(sharesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Shares',
                    data: [15, 12, 14, 13, 11, 12],
                    borderColor: '#FE2C55',
                    backgroundColor: 'rgba(254, 44, 85, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });

        // Retweets Chart (Twitter)
        const retweetsCtx = document.getElementById('retweetsChart').getContext('2d');
        new Chart(retweetsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Retweets',
                    data: [6, 7, 7.5, 8, 8.2, 8.7],
                    borderColor: '#1DA1F2',
                    backgroundColor: 'rgba(29, 161, 242, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    };

    // Tab switching functionality
    const setupTabs = () => {
        const tabs = document.querySelectorAll('.tab-btn');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Here you would typically load data for the selected platform
                console.log(`Switched to ${tab.dataset.platform} analytics`);
            });
        });
    };

    // Initialize everything
    initCharts();
    setupTabs();
    
    // Add animation delays for metric cards
    document.querySelectorAll('.metric-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});
