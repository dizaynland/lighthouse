/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/**
 * @fileoverview Audits a page to determine if it is calling deprecated APIs.
 * This is done by collecting console log messages and filtering them by ones
 * that contain deprecated API warnings sent by Chrome.
 */

const Audit = require('./audit.js');
const i18n = require('../lib/i18n/i18n.js');

const UIStrings = {
  /** Title of a Lighthouse audit that provides detail on the use of deprecated APIs. This descriptive title is shown to users when the page does not use deprecated APIs. */
  title: 'Avoids deprecated APIs',
  /** Title of a Lighthouse audit that provides detail on the use of deprecated APIs. This descriptive title is shown to users when the page uses deprecated APIs. */
  failureTitle: 'Uses deprecated APIs',
  /** Description of a Lighthouse audit that tells the user why they should not use deprecated APIs on their page. This is displayed after a user expands the section to see more. No character length limits. 'Learn More' becomes link text to additional documentation. */
  description: 'Deprecated APIs will eventually be removed from the browser. ' +
      '[Learn more](https://web.dev/deprecations).',
  /** [ICU Syntax] Label for the audit identifying the number of warnings generated by using deprecated APIs. */
  displayValue: `{itemCount, plural,
    =1 {1 warning found}
    other {# warnings found}
    }`,
  /** Header of the table column which displays the warning message describing use of a deprecated API by code running in the web page. */
  columnDeprecate: 'Deprecation / Warning',
  /** Table column header for line of code (eg. 432) that is using a deprecated API. */
  columnLine: 'Line',
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

class Deprecations extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'deprecations',
      title: str_(UIStrings.title),
      failureTitle: str_(UIStrings.failureTitle),
      description: str_(UIStrings.description),
    };
  }

  static get requiredArtifacts() {
    return this.artifacts('ConsoleMessages');
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @return {LH.Audit.Product}
   */
  static audit(artifacts) {
    const entries = artifacts.ConsoleMessages;

    const deprecations = entries.filter(log => log.entry.source === 'deprecation').map(log => {
      return {
        value: log.entry.text,
        url: log.entry.url || '',
        source: log.entry.source,
        lineNumber: log.entry.lineNumber,
      };
    });

    /** @type {LH.Audit.Details.Table['headings']} */
    const headings = [
      {key: 'value', itemType: 'text', text: str_(UIStrings.columnDeprecate)},
      {key: 'url', itemType: 'url', text: str_(i18n.UIStrings.columnURL)},
      {key: 'lineNumber', itemType: 'text', text: str_(UIStrings.columnLine)},
    ];
    const details = Audit.makeTableDetails(headings, deprecations);

    let displayValue = '';
    if (deprecations.length > 0) {
      displayValue = str_(UIStrings.displayValue, {itemCount: deprecations.length});
    }

    return {
      score: Number(deprecations.length === 0),
      displayValue,
      extendedInfo: {
        value: deprecations,
      },
      details,
    };
  }
}

module.exports = Deprecations;
module.exports.UIStrings = UIStrings;
