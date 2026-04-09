/**
 * Migration 010: Fix allowance cap field nesting.
 * Moves flat cap fields (weeklyCap, dailyCap, etc.) into nested caps sub-document
 * and renames payableOnTravel → payableOnTravelDays.
 */
export default {
  id: '010-fix-allowance-caps',
  description: 'Restructure flat allowance cap fields into nested caps object',

  async up(db) {
    const collection = db.collection('dealmemos');
    const cursor = collection.find({ 'allowances.0': { $exists: true } });

    let updated = 0;
    let skipped = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      let needsUpdate = false;
      const newAllowances = (doc.allowances || []).map((a) => {
        // Check if any flat cap fields exist (not already nested)
        const hasFlatCaps = a.weeklyCap !== undefined || a.dailyCap !== undefined ||
          a.maxDaysPerWeek !== undefined || a.excludeSundays !== undefined ||
          a.payableOnTravel !== undefined;

        if (!hasFlatCaps) return a;

        needsUpdate = true;
        const caps = a.caps || {};
        return {
          ...a,
          caps: {
            ...caps,
            weeklyCap: a.weeklyCap ?? caps.weeklyCap ?? null,
            dailyCap: a.dailyCap ?? caps.dailyCap ?? null,
            maxDaysPerWeek: a.maxDaysPerWeek ?? caps.maxDaysPerWeek ?? null,
            excludeSundays: a.excludeSundays ?? caps.excludeSundays ?? false,
            excludeSaturdays: caps.excludeSaturdays ?? false,
            payableOnTravelDays: a.payableOnTravel ?? caps.payableOnTravelDays ?? false,
            payableOnPrepDays: caps.payableOnPrepDays ?? false,
          },
          // Remove flat fields
          weeklyCap: undefined,
          dailyCap: undefined,
          maxDaysPerWeek: undefined,
          excludeSundays: undefined,
          payableOnTravel: undefined,
        };
      });

      if (needsUpdate) {
        // Clean undefined values
        const cleaned = newAllowances.map((a) => {
          const obj = { ...a };
          Object.keys(obj).forEach((k) => { if (obj[k] === undefined) delete obj[k]; });
          return obj;
        });

        await collection.updateOne(
          { _id: doc._id },
          { $set: { allowances: cleaned } }
        );
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`  Migration 010: ${updated} deal memos updated, ${skipped} already correct`);
  },
};
