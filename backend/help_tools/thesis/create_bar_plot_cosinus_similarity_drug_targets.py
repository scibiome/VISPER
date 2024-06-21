import locale
import matplotlib.pyplot as plt
import matplotlib as mpl
locale.setlocale(locale.LC_NUMERIC, "de_DE")
mpl.rcParams['axes.formatter.use_locale'] = True
mpl.rcParams.update({'font.size': 13})
#######################################################################################################################
# Create a bar plot for our thesis that shows correlations between cosinus similarity and drug targets for drug pairs #
#######################################################################################################################


x_values = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
bar_width = 0.1
y_values = [1.25, 2.42, 3.44, 5.29, 12.77, 45.71, 70.59, 100,100,0] 

# Plot the bar graph
plt.bar(x_values, y_values, width=bar_width, align='edge')
for i in range(len(x_values)):
    plt.text(x_values[i] + bar_width / 2, y_values[i], str(round(y_values[i], 2)), ha='center', va='bottom')

plt.xlabel('Kosinus-Ähnlichkeit')
plt.ylabel('Gemeinsame Medikamentenziele in Prozent')
plt.title('GDSC1')

plt.grid(axis='y')
plt.show()



x_values = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
bar_width = 0.1 
y_values = [1.28, 2.46, 4.24, 7.91, 19.58, 39.13, 74.07, 68.18, 66.67, 0.0]  

# Plot the bar graph
plt.bar(x_values, y_values, width=bar_width, align='edge')
for i in range(len(x_values)):
    plt.text(x_values[i] + bar_width / 2, y_values[i], str(round(y_values[i], 2)), ha='center', va='bottom')

plt.xlabel('Kosinus-Ähnlichkeit')
plt.ylabel('Gemeinsame Medikamentenziele in Prozent')
plt.title('GDSC2')

plt.grid(axis='y')
plt.show()