# Show macchina on start-up
macchina --interface wlo1 --show distribution  memory localip processorload

# Clear the terminal and run macchina with specified configs
mm() {
	clear
	macchina --interface wlo1 --show distribution  memory localip processorload
}
