ALTER TABLE "Organization"
ADD COLUMN "normalizedName" TEXT;

UPDATE "Organization"
SET "normalizedName" = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE("name", '^\s+|\s+$', '', 'g'),
        '\s+',
        ' ',
        'g'
    )
);

ALTER TABLE "Organization"
ALTER COLUMN "normalizedName" SET NOT NULL;

CREATE UNIQUE INDEX "Organization_normalizedName_key"
ON "Organization"("normalizedName");
