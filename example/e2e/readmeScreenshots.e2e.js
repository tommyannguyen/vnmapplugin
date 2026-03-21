/* global element, by, waitFor, describe, it, expect, beforeAll, afterEach */

/**
 * @file Captures screenshots for the plugin README.
 * Output: example/readme_assets/*.png
 *
 * Run:
 *   npx detox test -c ios e2e/readmeScreenshots.e2e.js
 */

const { mkdir, copyFile } = require('fs/promises');
const path = require('path');
const { execSync } = require('child_process');
const { device } = require('detox');

const outputDir = path.join(__dirname, '..', 'readme_assets');

const SCREENSHOTS = [
  {
    group: 'Map',
    example: 'Show Map',
    file: 'show_map',
    wait: 3000,
  },
  {
    group: 'Fill/RasterLayer',
    example: 'Vietnam Boundary',
    file: 'vietnam_boundary',
    wait: 3000,
  },
  {
    group: 'Annotations',
    example: 'Custom Callout',
    file: 'custom_callout',
    wait: 3000,
  },
  {
    group: 'Symbol/CircleLayer',
    example: 'Data Driven Circle Colors',
    file: 'data_driven_circle_colors',
    wait: 3000,
  },
  {
    group: 'Fill/RasterLayer',
    example: 'Choropleth Layer By Zoom Level',
    file: 'choropleth_layer',
    wait: 3000,
  },
  {
    group: 'Symbol/CircleLayer',
    example: 'Clustering Earthquakes',
    file: 'clustering_earthquakes',
    wait: 3000,
  },
  {
    group: 'Fill/RasterLayer',
    example: 'Image Overlay',
    file: 'image_overlay',
    wait: 3000,
  },
  {
    group: 'Animations',
    example: 'Animated Line',
    file: 'animated_line',
    wait: 3000,
  },
];

async function setSampleLocation() {
  const latitude = 10.762622;
  const longitude = 106.660172;
  execSync(`xcrun simctl location ${device.id} set ${latitude},${longitude}`);
}

async function saveScreenshot(name) {
  await mkdir(outputDir, { recursive: true });
  const imagePath = await device.takeScreenshot(name);
  const destPath = path.join(outputDir, `${name}.png`);
  await copyFile(imagePath, destPath);
  return destPath;
}

async function wait(ms) {
  try {
    await waitFor(element(by.id('no-such-view')))
      .toBeVisible()
      .withTimeout(ms);
  } catch (_e) {
    // expected timeout — used as a delay
  }
}

if (['true', 1, '1'].includes(process.env.SKIP_TESTS_NO_METAL)) {
  describe('README screenshots', () => {
    it('disabled on CI (no metal support)', () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe('README screenshots', () => {
    beforeAll(async () => {
      await device.launchApp({ permissions: { location: 'always' } });
    });

    afterEach(async () => {
      await device.launchApp({ permissions: { location: 'always' } });
      await device.reloadReactNative();
    });

    // Capture example home screen
    it('home screen', async () => {
      await device.setStatusBar({
        time: '11:34',
        batteryLevel: 1,
        batteryState: 'charged',
        dataNetwork: 'wifi',
        wifiMode: 'active',
        wifiBars: '3',
        cellularMode: 'searching',
      });

      await expect(element(by.text('Map'))).toBeVisible();
      await saveScreenshot('example_home');
    });

    SCREENSHOTS.forEach(({ group, example, file, wait: waitMs }) => {
      it(`${group} > ${example}`, async () => {
        await device.setStatusBar({
          time: '11:34',
          batteryLevel: 1,
          batteryState: 'charged',
          dataNetwork: 'wifi',
          wifiMode: 'active',
          wifiBars: '3',
          cellularMode: 'searching',
        });
        await setSampleLocation();

        await expect(element(by.text(group))).toBeVisible();
        await element(by.text(group)).tap();

        await waitFor(element(by.text(example)))
          .toBeVisible()
          .whileElement(by.id('example-list'))
          .scroll(50, 'down');
        await element(by.text(example)).tap();

        await wait(waitMs);

        await saveScreenshot(file);
      });
    });
  });
}
